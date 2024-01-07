const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { version } = require("../../package.json");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Endo-site API Docs",
      version,
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
        {
          name: "User authentication",
          description: "Authentication-related endpoints",
        },
        {
          name: "MTN-Integration",
          description: "MTN payment endpoints",
        },
      ],
    },
  apis: [__dirname + "/swagger.js"],
};

const swaggerSpec = swaggerJsdoc(options);


//Login
/**
 * @swagger
 * /auth/sign_in:
 *   post:
 *     tags:
 *       - User authentication
 *     summary: Sign-in user
 *     description: Sign in a user by email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successfully signed in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorDesc:
 *                   type: string
 *                 success:
 *                   type: string
 *       '400':
 *         description: Invalid details or too many attempts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorDesc:
 *                   type: string
 *                 success:
 *                   type: string
 */

//Sign up
/**
 * @swagger
 * /auth/sign_up:
 *   post:
 *     tags:
 *       - User authentication
 *     summary: Sign up user
 *     description: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstname
 *               - lastname
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       '200':
 *         description: Successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorDesc:
 *                   type: string
 *                 success:
 *                   type: string
 *       '400':
 *         description: Invalid request or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorDesc:
 *                   type: string
 *                 success:
 *                   type: string
 */


//Auth Otp
/**
 * @swagger
 * /auth/confirm_otp:
 *   post:
 *     tags:
 *       - User authentication
 *     summary: OTP Authentication
 *     description: Authenticate user using OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - auth_otp
 *             properties:
 *               email:
 *                 type: string
 *               auth_otp:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful OTP authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     firstname:
 *                       type: string
 *                     lastname:
 *                       type: string
 *                     phone_number:
 *                       type: string
 *                 token:
 *                   type: string
 *                 success:
 *                   type: string
 *       '400':
 *         description: Invalid OTP or exceeded trials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorDesc:
 *                   type: string
 *                 success:
 *                   type: string
 */

//Get users
/**
 * @swagger
 * /auth/users:
 *   get:
 *     tags:
 *       - User authentication
 *     summary: Get all users
 *     description: Retrieve all users' data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       // Define your user properties here
 *                 success:
 *                   type: string
 *       '401':
 *         description: Unauthorized or invalid/expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '403':
 *         description: Missing authorization token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */





//Create momo user
/**
 * @swagger
 * /momo/create_momo_user:
 *   post:
 *     tags:
 *       - MTN-Integration
 *     summary: Create Momo user
 *     description: Register a momo user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - providerCallbackHost
 *             properties:
 *               providerCallbackHost:
 *                 type: string
 *     responses:
 *       '200':
 *         description: User Created Successfully
 *         content:
 *           application/json:
 *             headers:
 *               Ocp-Apim-Subscription-Key: 1b8492b3832d44fdae0274aa3fa7db1d
 *             schema:
 *               type: object
 *               properties:
 *                 errorDesc:
 *                   type: string
 *                 success:
 *                   type: string
 *       '400':
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errorDesc:
 *                   type: string
 *                 success:
 *                   type: string
 */


exports.swaggerDocs = (app, port) => {
  // Swagger page
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get("/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
  

  console.log(`Docs available at http://localhost:${port}/docs`);
}