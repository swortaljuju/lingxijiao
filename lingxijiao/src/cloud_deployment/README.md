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