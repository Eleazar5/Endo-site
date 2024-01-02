### Backend
1. Download the Node.js pre-built installer for your platform from <br />
 https://nodejs.org/en/download/ if not installed and remember to set your database
2. Open the folder from the command prompt <br />
```
cd Mobi-duka
```
3. Set .env files
```
SERVER_PORT = 'PORT'
SERVER_HOST='localhost'
DB_HOST='localhost'
DB_USER='root'
DB_PASS=''
DB_NAME='mobi_duka'
SECRETKEY='mobidukasecret'

PASSKEY = ''

SHORTCODE = ''
CONSUMERKEY = ''
CONSUMERSECRET = ''

initiatorname=""
initiatorPassword=""

mailUser='eleazarsimba3000@gmail.com'
mailPass='ynry bfzv mdgl uwnt'

WHATSAPP_TOKEN = ""
VERIFY_TOKEN = ""

saveActiviyLogs = true
saveDatabaseBackup = true
environment = 'live' # else 'test'
sitebaseURL = "https://94a0-197-248-82-61.ngrok-free.app"
```
4. install the dependencies
```
npm install 
npm start or npm run dev
```
***Happy Coding***
