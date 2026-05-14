### Scenario: Registrazione avvenuta con successo

**Precondizioni**
* L'utente si trova sulla pagina di registrazione
* L'utente ha scelto un piano

**Svolgimento**
1. L'utente inserisce i dati dell'azienda
2. L'utente inserisce i dati dell'amministratore
3. L'utente invia la form di registrazione
4. I dati inseriti vengono validati e sono formalmente corretti
5. L'utente viene indirizzato alla pagina di pagamento
6. L'utente effettua il pagamento e va a buon fine
7. L'azienda dell'utente viene aggiunta al database e viene aggiunta la sua licenza per collegarla al piano scelto
8. Viene creato il database ad hoc per l'azienda dell'utente
9. L'amministratore viene aggiunto tra i dipendenti
10. Viene inviata un'email di avvenuta registrazione all'amministratore

**Postcondizioni**
* L'azienda è presente tra i vari tenant
* L'amministratore è registrato e può accedere al sistema

---

### Scenario: Registrazione fallita a causa di dati formalmente errati

**Precondizioni**
* L'utente si trova sulla pagina di registrazione
* L'utente ha scelto un piano

**Svolgimento**
1. L'utente inserisce i dati dell'azienda
2. L'utente inserisce i dati dell'amministratore
3. L'utente invia la form di registrazione
4. I dati inseriti vengono validati e la partita IVA inserita risulta inesistente
5. Viene restituito un errore

**Postcondizioni**
* L'azienda non è stata aggiunta tra i tenant
* L'amministratore non è registrato e, di conseguenza, non può accedere