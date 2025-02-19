const https = require("https");
const { execSync } = require("child_process");

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const version = process.argv[2]; // Release version
const repoUrl = process.argv[3]; // Repository URL
const branch = process.env.GITHUB_REF?.replace("refs/heads/", "") || "main"; // Branch name
const author = process.env.GITHUB_ACTOR || "Unknown"; // Release author
const timestamp = new Date().toLocaleString("en-US", { timeZone: "UTC" }); // Release timestamp in UTC

if (!SLACK_WEBHOOK_URL) {
    // eslint-disable-next-line no-console
    console.error("❌ Error: SLACK_WEBHOOK_URL is not set.");
    process.exit(1);
}

// Get the first 10 lines from CHANGELOG.md (latest updates)
let changelog = "";
try {
    changelog = execSync("head -n 10 CHANGELOG.md").toString().trim();
} catch (err) {
    // eslint-disable-next-line no-console
    console.error("❌ Error reading CHANGELOG.md:", err.message);
}

// Generate URLs
const branchUrl = `${ repoUrl }/tree/${ branch }`;
const authorUrl = `https://github.com/${ author }`;
const diffUrl = `${ repoUrl }/compare/v${ version.replace(/\.\d+$/, ".0") }...v${ version }`;
const changelogUrl = `${ repoUrl }/blob/main/CHANGELOG.md`;

const message = {
    text: `🚀 *New Release:* *v${ version }* \n🔗 <${ repoUrl }/releases/tag/v${ version }|View Release>`,
    attachments: [
        {
            color: "#36a64f",
            fields: [
                { title: "Branch", value: `<${ branchUrl }|${ branch }>`, short: true },
                { title: "Author", value: `<${ authorUrl }|${ author }>`, short: true },
                { title: "Release Time (UTC)", value: timestamp, short: true },
                { title: "Changelog", value: `<${ changelogUrl }|View full CHANGELOG>`, short: false },
                {
                    title: "Recent Changes",
                    value: changelog ? `\`\`\`\n${ changelog }\n\`\`\`` : "_No changes available_",
                    short: false,
                },
                { title: "GitHub Diff", value: `<${ diffUrl }|View Changes>`, short: false },
            ],
        },
    ],
};

const requestData = JSON.stringify(message);

const requestOptions = new URL(SLACK_WEBHOOK_URL);
const req = https.request(
    {
        hostname: requestOptions.hostname,
        path: requestOptions.pathname,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(requestData),
        },
    },
    (res) => {
        let responseData = "";
        res.on("data", (chunk) => {
            responseData = responseData + chunk;
        });

        res.on("end", () => {
            // eslint-disable-next-line no-console
            console.log(`🔹 Slack Response: ${ res.statusCode } ${ responseData }`);
            if (res.statusCode === 200) {
                // eslint-disable-next-line no-console
                console.log("✅ Notification successfully sent to Slack.");
            } else {
                // eslint-disable-next-line no-console
                console.error(`❌ Error sending notification: ${ res.statusCode }`);
            }
        });
    },
);

req.on("error", (err) => {
    // eslint-disable-next-line no-console
    console.error(`❌ Request error: ${ err.message }`);
});

req.write(requestData);
req.end();
