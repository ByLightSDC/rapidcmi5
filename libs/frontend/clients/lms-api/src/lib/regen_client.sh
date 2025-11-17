#!/bin/bash
# curl -o swagger.json http://localhost:8080/docs/swagger.json
curl -o swagger.json https://lms-api.develop-cp.rangeos.engineering/docs/swagger.json
# added --skip-validate-spec to generate command as workaround for a bug (similar to?)
# https://github.com/OpenAPITools/openapi-generator/issues/1324
npx openapi-generator-cli generate -i ./swagger.json -g typescript-axios -o . --skip-validate-spec --global-property skipFormModel=false
sed -i.bak "s/localVarFormParams.append('roleVariablesSchema', new Blob(\[JSON.stringify(roleVariablesSchema)\], { type: \"application\/json\", }));/localVarFormParams.append('roleVariablesSchema', JSON.stringify(roleVariablesSchema));/" api.ts
sed -i.bak "s/localVarFormParams.append('bootDetails', new Blob(\[JSON.stringify(bootDetails)\], { type: \"application\/json\", }));/localVarFormParams.append('bootDetails', JSON.stringify(bootDetails));/" api.ts
rm api.ts.bak
