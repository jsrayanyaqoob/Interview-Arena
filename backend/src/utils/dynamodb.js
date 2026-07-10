const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const dynamoDBClient = new AWS.DynamoDB();

const TABLES = {
  INTERVIEW_SESSIONS: 'interview_sessions',
  ANALYTICS_EVENTS: 'analytics_events',
  CACHE: 'api_cache',
};

/**
 * Initialize DynamoDB tables if they don't exist
 */
async function initTables() {
  const tables = [
    {
      TableName: TABLES.INTERVIEW_SESSIONS,
      KeySchema: [{ AttributeName: 'sessionId', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'sessionId', AttributeType: 'S' }],
      BillingMode: 'PAY_PER_REQUEST',
    },
    {
      TableName: TABLES.ANALYTICS_EVENTS,
      KeySchema: [
        { AttributeName: 'eventType', KeyType: 'HASH' },
        { AttributeName: 'timestamp', KeyType: 'RANGE' },
      ],
      AttributeDefinitions: [
        { AttributeName: 'eventType', AttributeType: 'S' },
        { AttributeName: 'timestamp', AttributeType: 'S' },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    },
    {
      TableName: TABLES.CACHE,
      KeySchema: [{ AttributeName: 'cacheKey', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'cacheKey', AttributeType: 'S' }],
      BillingMode: 'PAY_PER_REQUEST',
      TimeToLiveSpecification: {
        AttributeName: 'ttl',
        Enabled: true,
      },
    },
  ];

  for (const tableParams of tables) {
    try {
      const existing = await dynamoDBClient.listTables().promise();
      if (!existing.TableNames.includes(tableParams.TableName)) {
        await dynamoDBClient.createTable(tableParams).promise();
        console.log(`DynamoDB table created: ${tableParams.TableName}`);
      }
    } catch (error) {
      // If DynamoDB is not available (e.g., local development without AWS creds),
      // just log a warning and continue
      if (error.code === 'CredentialsError' || error.code === 'NetworkingError') {
        console.warn(`DynamoDB not available: ${error.message}. Running without DynamoDB.`);
        break;
      }
      console.warn(`DynamoDB table check failed for ${tableParams.TableName}: ${error.message}`);
    }
  }
}

/**
 * Store interview session data in DynamoDB
 */
async function storeInterviewSession(sessionId, data) {
  try {
    await dynamoDB.put({
      TableName: TABLES.INTERVIEW_SESSIONS,
      Item: {
        sessionId,
        ...data,
        createdAt: new Date().toISOString(),
        ttl: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days TTL
      },
    }).promise();
    return true;
  } catch (error) {
    console.error('DynamoDB storeInterviewSession error:', error.message);
    return false;
  }
}

/**
 * Get interview session from DynamoDB
 */
async function getInterviewSession(sessionId) {
  try {
    const result = await dynamoDB.get({
      TableName: TABLES.INTERVIEW_SESSIONS,
      Key: { sessionId },
    }).promise();
    return result.Item || null;
  } catch (error) {
    console.error('DynamoDB getInterviewSession error:', error.message);
    return null;
  }
}

/**
 * Record an analytics event in DynamoDB
 */
async function recordAnalyticsEvent(eventType, data) {
  try {
    await dynamoDB.put({
      TableName: TABLES.ANALYTICS_EVENTS,
      Item: {
        eventType,
        timestamp: new Date().toISOString(),
        ...data,
        ttl: Math.floor(Date.now() / 1000) + 86400 * 90, // 90 days TTL
      },
    }).promise();
    return true;
  } catch (error) {
    console.error('DynamoDB recordAnalyticsEvent error:', error.message);
    return false;
  }
}

/**
 * Get analytics events by type with time range
 */
async function getAnalyticsEvents(eventType, startTime, endTime) {
  try {
    const params = {
      TableName: TABLES.ANALYTICS_EVENTS,
      KeyConditionExpression: 'eventType = :eventType AND #ts BETWEEN :start AND :end',
      ExpressionAttributeNames: { '#ts': 'timestamp' },
      ExpressionAttributeValues: {
        ':eventType': eventType,
        ':start': startTime || new Date(Date.now() - 86400000 * 30).toISOString(),
        ':end': endTime || new Date().toISOString(),
      },
    };

    const result = await dynamoDB.query(params).promise();
    return result.Items || [];
  } catch (error) {
    console.error('DynamoDB getAnalyticsEvents error:', error.message);
    return [];
  }
}

/**
 * Cache data in DynamoDB with TTL
 */
async function cacheSet(key, value, ttlSeconds = 300) {
  try {
    await dynamoDB.put({
      TableName: TABLES.CACHE,
      Item: {
        cacheKey: key,
        value: JSON.stringify(value),
        createdAt: new Date().toISOString(),
        ttl: Math.floor(Date.now() / 1000) + ttlSeconds,
      },
    }).promise();
    return true;
  } catch (error) {
    console.error('DynamoDB cacheSet error:', error.message);
    return false;
  }
}

/**
 * Get cached data from DynamoDB
 */
async function cacheGet(key) {
  try {
    const result = await dynamoDB.get({
      TableName: TABLES.CACHE,
      Key: { cacheKey: key },
    }).promise();

    if (!result.Item) return null;

    // Check if expired (DynamoDB TTL may not have cleaned it yet)
    if (result.Item.ttl && Math.floor(Date.now() / 1000) > result.Item.ttl) {
      return null;
    }

    return JSON.parse(result.Item.value);
  } catch (error) {
    console.error('DynamoDB cacheGet error:', error.message);
    return null;
  }
}

module.exports = {
  initTables,
  storeInterviewSession,
  getInterviewSession,
  recordAnalyticsEvent,
  getAnalyticsEvents,
  cacheSet,
  cacheGet,
  TABLES,
};
