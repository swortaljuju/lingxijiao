# Overview
灵犀角 is social media for people to know each other and start a love relationship through short but inspiring posts and answers. 

[Design doc](design_doc.md);
[Tech stack](tech_stacks.md);

# Project setup
Clone the repo and do a `npm install`.
Setup Vscode and load the `launch.json` into workspace configuration. Then just do `Run -> start debugging` in `index.ts`. You should be able to debug TypeScript code in Vscode.  

**Environment**: Ubuntu 18.04 

**Linter**: Vscode's tslint.

## Mongodb:
**Version**: 4.4  
[Installation guide](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)  
[Update `ulimit` hard limit](https://superuser.com/questions/1200539/cannot-increase-open-file-limit-past-4096-ubuntu).

start mongodb:
```
sudo mkdir -p /data/db
sudo mongod
```

## Start app
1. Copy .env.dev to .env and update the envoriment variables in .env with production values.
2. Initialize node-modules with `npm install`
3. Build and start server in dev mode: `npm run start-dev`
4. Or build and start server in prod mode: `npm run start-prod`  
    





