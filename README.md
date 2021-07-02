# README

```
npm install 
node app.js
```

Use PM2 to manage (as root for sonos bridge):

```
npm install pm2@latest -g
pm2 start app.js --name sonos-state --time
```

Config PM2 to startup
```
pm2 startup
pm2 save
```
