## CMI5 player

<a id="toc" name="toc">**Quick Links**</a> <br/>
[About](#about-app) <br/>
[Serve App](#serve-app) <br/>
[Local Testing](#local-tests) <br/>

### <a name="about-app">About</a>

React app renders markup into a slide presentation.

---

### <a name="serve-app">Serve App</a>

To serve

```bash
   nx serve cc-cmi5-player --skip-nx-cache
```

If running locally, you will need to authenticate and reroute to a course

---

### <a name="env-vars">Env Vars</a>

Environment Variables

```bash
   # Run content in legacy slide renderer
   NX_PUBLIC_CMI5_PLAYER_VERSION=0
```

Certain env vars can be overridden by editing cfg.json

---

### <a name="local-tests">Local Testing</a>

In order to test locally, you need a cmi5 course to be present in your published build directory.<br/>
As a one time set up, copy the placeholder files into the nx project. Note - this directory is ignored by git.

##### Destination Path

/libs/ui/components/branded/src/assets/cmi5-player/

Then, edit the project config to automatically copy these files into the output folder during build

##### Project Config

/apps/cc-cmi5-player/project.json

```js
{
  "assets": [
          "apps/cc-cmi5-player/src/assets",
         {
            "input": "apps/cc-cmi5-player/src/test/",
            "glob": "**/*",
            "output": "."
          }
        ],
}
```

##### Authenticate

replace name and reg
name will appear on Manage Ranges dashboard in Range OS
reg can be used to re-access a scenario previously deployed

    curl -X POST -H "Authorization: Bearer <Your Token>" -H "Content-Type: application/json" -d '{
    "actor": {
    "objectType": "Agent",
    "account": {
      "homePage": "https://moodle.com",
      "name": "test"
    }
    },"reg": "169bb80d-b76b-46ce-b7dc-831438153076",
    "returnUrl": "https://lms.example.com/return"}' https://cpt-player.prod-cp.rangeos.engineering/api/v1/course/21/launch-url/3  | jq -r '.url' | awk -F '?' '{print "http://localhost:4200?" $2}'

    change URL for develop
    https://cpt-player.develop-cp.rangeos.engineering/api/v1/course/513/launch-url/0
