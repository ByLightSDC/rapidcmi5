## Range OS Infrastructure Portal

<a id="toc" name="toc">**Quick Links**</a> <br/>
[About](#about-app) <br/>
[Serve App](#serve-app) <br/>
[Jest Tests](#jest-tests) <br/>
[Integration Testing](#integration-tests) <br/>
[Lint](#lint) <br/>
[Local Testing](#local-tests) <br/>

### <a name="about-app">About</a>

React app presents form views and other visualizations to support creating and maintaing RangeOS Infrastructure & Content.

---

### <a name="serve-app">Serve App</a>

To serve

```bash
   nx serve rapid-cmi5-electron-frontend  --skip-nx-cache
```

---

### <a name="keycloak-config">KeyCloak Configuration</a>

To enable KeyCloak, specify a client id:

```js
{
  NX_PUBLIC_KEYCLOAK_CLIENT_ID = frontend;
}
```

To disable KeyCloak:

```js
{
  NX_PUBLIC_KEYCLOAK_CLIENT_ID = null;
}
```

---

### [Jest Tests](#jest-tests)

Run jest tests

```bash
  npx nx test rapid-cmi5-electron-frontend
```

---

### [Integration Tests](#integration-tests)

Integration tests are in a separate e2e application

Modify environment variables to run with mock data

```js
{
  NX_PUBLIC_MSW_MOCK = true;
}
```

Run integration tests

```bash
   nx run rapid-cmi5-electron-frontend-e2e:e2e --watch
```

---

### [Lint](#lint)

Lint the project\
Install Microsoft ESLint Plugin Visual Studio Extension

```bash
   npx eslint apps/rapid-cmi5-electron-frontend/src
```

---

### <a name="local-tests">Local Testing</a>

Test locally by following the URL output in console after serving, typically localhost:4200\
ENV variables can be changed to point to alternate API versions


```js
NX_PUBLIC_DEVOPS_API_URL=https://rangeos-api.develop-cp.rangeos.engineering
NX_PUBLIC_DEVOPS_GQL_URL=https://rangeos-graphql.develop-cp.rangeos.engineering/
NX_PUBLIC_DEVOPS_GQL_SUBSCRIPTIONS_URL=wss:////rangeos-graphql.develop-cp.rangeos.engineering
```
