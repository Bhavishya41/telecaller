// server/openapi.js
export const openapiSpec = {
    openapi: '3.1.0',
    info: {
        title: 'TeleConnect API Reference',
        version: '1.0.0',
        description: 'RESTful API gateway for TeleConnect telecalling & lead management system.',
    },
    servers: [
        {
            url: '/api',
            description: 'Current API Gateway',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    security: [{ bearerAuth: [] }],
    paths: {
        '/auth/register': {
            post: {
                tags: ['Authentication'],
                summary: 'Register a new telecaller/admin account',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'password', 'phone', 'pincode'],
                                properties: {
                                    name: { type: 'string', example: 'Bhavishya Jain' },
                                    email: { type: 'string', example: 'bhavishya@example.com' },
                                    password: { type: 'string', example: 'Secr3tP@ss' },
                                    phone: { type: 'string', example: '9876543210' },
                                    pincode: { type: 'string', example: '390001' },
                                    role: { type: 'string', enum: ['admin', 'staff'], default: 'staff' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: 'User account registered successfully' },
                    400: { description: 'Validation error or duplicate email' },
                },
            },
        },
        '/auth/login': {
            post: {
                tags: ['Authentication'],
                summary: 'Authenticate user and return JWT',
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', example: 'bhavishya@example.com' },
                                    password: { type: 'string', example: 'Secr3tP@ss' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Authentication successful; returns token and user profile' },
                    401: { description: 'Invalid email or password' },
                },
            },
        },
        '/businesses': {
            get: {
                tags: ['Leads'],
                summary: 'Get all business leads with optional filtering',
                parameters: [
                    { name: 'category', in: 'query', schema: { type: 'string' }, example: 'Electronics' },
                    { name: 'city', in: 'query', schema: { type: 'string' }, example: 'Vadodara' },
                    { name: 'registered', in: 'query', schema: { type: 'string', enum: ['true', 'false', 'All'] } },
                ],
                responses: {
                    200: { description: 'Array of lead documents returned' },
                    401: { description: 'Missing or expired JWT' },
                },
            },
            post: {
                tags: ['Leads'],
                summary: 'Create a single business lead',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['businessName', 'phoneNumbers'],
                                properties: {
                                    businessName: { type: 'string', example: 'Apex Cloud Infotech' },
                                    ownerName: { type: 'string', example: 'Nikhil Patel' },
                                    phoneNumbers: { type: 'array', items: { type: 'string' }, example: ['9825012345'] },
                                    email: { type: 'string', example: 'contact@apexcloud.in' },
                                    category: { type: 'string', example: 'Computer & IT Softwares' },
                                    pincode: { type: 'string', example: '390023' },
                                    city: { type: 'string', example: 'Vadodara' },
                                    state: { type: 'string', example: 'Gujarat' },
                                    registered: { type: 'boolean', default: false },
                                },
                            },
                        },
                    },
                },
                responses: {
                    201: { description: 'Lead saved to database' },
                },
            },
        },
        '/businesses/{id}': {
            put: {
                tags: ['Leads'],
                summary: 'Update lead details, disposition status, or followup notes',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    registered: { type: 'boolean' },
                                    followup: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Lead updated successfully' },
                },
            },
            delete: {
                tags: ['Leads'],
                summary: 'Delete lead record (Admin only)',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
                ],
                responses: {
                    200: { description: 'Lead deleted' },
                    403: { description: 'Unauthorized role' },
                },
            },
        },
        '/businesses/assign': {
            put: {
                tags: ['Telecaller Allocation'],
                summary: 'Batch assign selected leads to a telecaller staff member',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['businessIds', 'staffId'],
                                properties: {
                                    businessIds: { type: 'array', items: { type: 'string' } },
                                    staffId: { type: 'string' },
                                },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Leads successfully assigned' },
                },
            },
        },
        '/businesses/import': {
            post: {
                tags: ['Leads'],
                summary: 'Bulk import parsed leads from Excel',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: { type: 'object' },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Batch import persisted' },
                },
            },
        },
        '/users': {
            get: {
                tags: ['Telecaller Allocation'],
                summary: 'Get all telecallers/staff for assignment dropdown (Admin only)',
                responses: {
                    200: { description: 'Array of user objects' },
                    403: { description: 'Admin access required' },
                },
            },
        },
    },
};