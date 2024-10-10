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

DBTYPE='ormsql'  # else 'mysql' ,'postgres', 'mongo'
organization='Sm@rt Tech'
emailuser=''
orgphone=''
emailusertitle='Software Engineer'
orgsite='www.endosite.co.ke'

PASSKEY = ''

SHORTCODE = ''
CONSUMERKEY = ''
CONSUMERSECRET = ''

initiatorname=""
initiatorPassword=""

mailUser='eleazarsimba3000@gmail.com'
mailPass=''

WHATSAPP_TOKEN = ""
VERIFY_TOKEN = ""

saveActiviyLogs = true
saveDatabaseBackup = true
environment = 'live' # else 'test'
sitebaseURL = ""
```
4. install the dependencies
```
npm install 
npm start or npm run dev
```
```
# Momo MTN
momo_apikey = "430a578a0fae4afaadfc4b96f4d89b6f"
momo_Ocp_Apim_Subscription_Key = '1b8492b3832d44fdae0274aa3fa7db1d' #Primary Key
momo_X_Reference_id = '62fea989-756f-4a04-a66b-df8b2c1dbbab'
momo_Target_Env='sandbox'

# Jenga Api
bankenvironment='sandbox'
merchantcode='7716736835'

# Airtel Money
airtel_environment='test'
airtelclient_id='4a960ebc-fc0c-469a-b36d-b4b9add3399f'
airtelclient_secret='4a960ebc-fc0c-469a-b36d-b4b9add3399f'
```
***Happy Coding***
