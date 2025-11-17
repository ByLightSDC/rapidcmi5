# frontend-clients-devops-api

To remake this:

```
nx serve devops-api
cd libs/frontend/clients/devops-api/src/lib
./regen_client.sh
```

```
nx serve devops-api
cd libs/frontend/clients/devops-api/src/lib
curl -o swagger.json http://localhost:8080/docs/swagger.json
// TODO FIGURE out why  skipFormModel=false is needed for Vm image when generating the client
npx openapi-generator-cli generate -i ./swagger.json -g typescript-axios -o . --global-property skipFormModel=false
git checkout base.ts to undo change made in the file.
```
