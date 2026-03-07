<?php

namespace App\Core;

class Router
{
    private $methods = [];

    public function get($path, $callback)
    {
        $this->createRoute('GET', $path, $callback[0], $callback[1]);
    }

     public function post($path, $callback)
    {
        $this->createRoute('POST', $path, $callback[0], $callback[1]);
    }

    public function put($path, $callback)
    {
        $this->createRoute('PUT', $path, $callback[0], $callback[1]);
    }

    public function delete($path, $callback)
    {
        $this->createRoute('DELETE', $path, $callback[0], $callback[1]);
    }

    public function head($path, $callback)
    {
        $this->createRoute('HEAD', $path, $callback[0], $callback[1]);
    }

    private function createRoute($method, $path, $controller, $controllerMethod)
    {
        $this->methods[$method][$path] = [
            "controller" => $controller,
            "controllerMethod" => $controllerMethod
        ];
    }

    public function run() 
    {
        $requestMethod = $_SERVER['REQUEST_METHOD'];

        $parsedUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $requestPath = trim($parsedUri, "/");

        if (defined('ROOT')) {
            $baseFolder = trim(ROOT, "/");
            if($baseFolder !== '' && strpos($requestPath, $baseFolder) === 0) {
                $requestPath = trim(substr($requestPath, strlen($baseFolder)), "/");
            }
        }

        // Recupero delle rotte per il metodo richiesto
        $methodRoutes = $this->methods[$requestMethod] ?? [];

        foreach ($methodRoutes as $routePath => $controllerAction) {

            // Sostituisce la parte dinamica della rotta con una regex che accetta tutti i valori che la rispettano
            // Serve perchè le rotte dinamiche verranno definite come rotta/{elemento_dinamico}, perciò bisogna mettere una regex che intercetti correttamente la parte dinamica al posto della scritta {elemento_dinamico}
            $pattern = preg_replace('#\{[a-zA-Z0-9_]+\}#', '([a-zA-Z0-9_]+)', $routePath);
            $pattern = "#^" . $pattern . "$#";

            if(preg_match($pattern, $requestPath, $matches)) {
                // matches[0] contiene tutto l'URL perciò si taglia
                array_shift($matches);

                $params = $matches;

                $controllerName = $controllerAction['controller'];
                $methodName = $controllerAction['controllerMethod'];

                if(class_exists($controllerName)) {
                    $controllerObject = new $controllerName();

                    if(method_exists($controllerObject, $methodName)) {
                        call_user_func_array([$controllerObject, $methodName], $params);
                        return;
                    } else {
                        Response::response("Internal Server Error", 500, "Method '{$methodName}' not found in the controller");
                        return;
                    }
                } else {
                    Response::response("Internal Server Error", 500, "Controller '{$controllerName}' not found");
                    return;
                }
            }
        }

        $allowedMethods = [];

        foreach ($this->methods as $storedMethod => $routes) {
            if ($storedMethod === $requestMethod) continue;

            foreach ($routes as $routePath => $target) {
                $pattern = preg_replace('#\{[a-zA-Z0-9_]+\}#', '([a-zA-Z0-9_]+)', $routePath);
                $pattern = "#^" . $pattern . "$#";

                if (preg_match($pattern, $requestPath)) {
                    $allowedMethods[] = $storedMethod;
                    break;
                }
            }
        }

        if (count($allowedMethods) > 0) {
            Response::response("Method Not Allowed", 405, "Method Not Allowed. Allowed: " . implode(", ", $allowedMethods));
            return;
        }

        Response::response("Not found", 404, "Requested URL not found");
    }
}