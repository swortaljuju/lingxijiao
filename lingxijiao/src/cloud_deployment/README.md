# AWS cloud deployment steps  
1. Setup ssh to lightsail instance. See this [doc](https://lightsail.aws.amazon.com/ls/docs/en_us/articles/amazon-lightsail-ssh-using-terminal)
2. setup github credentials and clone repo.
3. run `npm install` in github repo. 
4. install pm2 globally `sudo npm install -g pm2`
5. ` sudo netstat -tulpn| grep LISTEN`