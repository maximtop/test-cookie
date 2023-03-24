/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
}

async function handleRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const url = new URL(request.url);
	const isDocumentRequest = url.pathname === "/" && request.method === "GET";

	if (!isDocumentRequest) {
		return fetch(request);
	}

	const cookieHeader = request.headers.get("Cookie");
	let currentVisitCount = 0;

	if (cookieHeader) {
		const cookies = cookieHeader.split(";").map(cookie => cookie.trim());
		const visitCountCookie = cookies.find(cookie => cookie.startsWith("visitCount="));

		if (visitCountCookie) {
			currentVisitCount = parseInt(visitCountCookie.split("=")[1]);
		}
	}

	const newVisitCount = currentVisitCount + 1;
	const responseBody = `Hello World! You have visited this page ${newVisitCount} times.`;

	const response = new Response(responseBody, {
		headers: {
			"Content-Type": "text/plain",
		},
	});

	// Set the new visitCount cookie with a one-month expiration
	const secondsInOneMonth = 30 * 24 * 60 * 60;

	response.headers.append(
		"Set-Cookie",
		`visitCount=${newVisitCount}; Max-Age=${secondsInOneMonth}; Secure; HttpOnly; SameSite=Lax`
	);

	return response;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return handleRequest(request, env, ctx);
	},
};


