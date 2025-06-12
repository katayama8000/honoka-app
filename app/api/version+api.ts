import {version} from "../../package.json"


// curl -s http://localhost:8081/api/version | jq .
export const GET = async (_: Request) => {
  try {
    const environment = process.env.EXPO_PUBLIC_ENV || "development";
    return Response.json({
      version,
      environment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
