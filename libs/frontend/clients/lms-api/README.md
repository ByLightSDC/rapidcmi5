# frontend-clients-lms-api

To remake this:

```
nx serve lms-api
cd libs/frontend/clients/lms-api/src/lib
./regen_client.sh
```

```
nx serve lms-api
cd libs/frontend/clients/lms-api/src/lib
curl -o swagger.json http://localhost:8080/docs/swagger.json
// TODO FIGURE out why  skipFormModel=false is needed for Vm image when generating the client
npx openapi-generator-cli generate -i ./swagger.json -g typescript-axios -o . --global-property skipFormModel=false
git checkout base.ts to undo change made in the file.
```
