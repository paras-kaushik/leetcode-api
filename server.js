const express = require('express');
const cors = require('cors');
const app = express();
const axios = require('axios');
app.use(cors()); // Enable CORS for all routes

const PORT = 5000;
// Just some constants
const LEETCODE_API_ENDPOINT = 'https://leetcode.com/graphql'
const DAILY_CODING_CHALLENGE_QUERY = `
query questionOfToday {
	activeDailyCodingChallengeQuestion {
		date
		userStatus
		link
		question {
			acRate
			difficulty
			freqBar
			frontendQuestionId: questionFrontendId
			isFavor
			paidOnly: isPaidOnly
			status
			title
			titleSlug
			hasVideoSolution
			hasSolution
			topicTags {
				name
				id
				slug
			}
		}
	}
}`

const problemDetailQuery = `
  query questionContent($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      content
      mysqlSchemas
      dataSchemas
    }
  }
`;

app.get('/graphql-query', async (req, res) => {
	const graphqlEndpoint = LEETCODE_API_ENDPOINT;
	try {
		const response = await axios.post(graphqlEndpoint, { query: DAILY_CODING_CHALLENGE_QUERY });
		const responseData = { ...response.data.data };
		console.log(responseData);
		const titleSlug = responseData.activeDailyCodingChallengeQuestion.question.titleSlug;

		const variables = {
			titleSlug
		};

		const response2 = await axios.post(graphqlEndpoint, { query: problemDetailQuery, variables });
		const apiResponseObject = {
			title: responseData.activeDailyCodingChallengeQuestion.question.title,
			leetcodeLink: `https://leetcode.com${responseData.activeDailyCodingChallengeQuestion.link}`,
			problemDescHTML: response2.data.data.question.content,
			difficulty: responseData.activeDailyCodingChallengeQuestion.question.difficulty,
			topicTags: responseData.activeDailyCodingChallengeQuestion.question.topicTags

		}
		res.json(apiResponseObject);
	} catch (error) {
		res.status(500).json({ error: 'Failed to query the GraphQL server during query 1' });
	}
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
