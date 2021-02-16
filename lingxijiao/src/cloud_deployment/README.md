# AWS cloud deployment steps  
1. Setup ssh to lightsail instance. See this [doc](https://lightsail.aws.amazon.com/ls/docs/en_us/articles/amazon-lightsail-ssh-using-terminal)
2. setup github credentials and clone repo.
3. run `npm install` in github repo. 
4. install pm2 globally `sudo npm install -g pm2`
5. `sudo netstat -tulpn| grep LISTEN` to check port listening process
6. Go to mongo console, initialize prod db and user for the prod db. [ref](https://docs.bitnami.com/aws/infrastructure/mongodb/configuration/create-database/); Then put the db name, user name, password in .env.
7. Update server/.env with credentials
8. Start nginx
9. Start mongodb
10. `npm run build-prod`
11. Go to cloud_deployment folder and run `start.sh {num of process}` to launch nodejs.
12. `reload.sh` reload latest nodejs source without stoping it. 
13. `cat /tmp/lingxijiao*` to check nodejs log

# Release process:
## Version number format:
{major version number}.{minor version number}  

## Major release:
1. Check out a new branch from head of master with major version number as branch name e.g. `git checkout 1.0`
2. Push the new branch to remote.
3. Create a new release and point the release version tag to the head of the major version branch.

## Minor release:
1. Check out the major version's branch.
2. Cherry pick any commits from master to the version's branch.
3. Push the commits to remote. 
4. Create a new release with a new minor version number and point the release version tag to the head of the major version branch.
