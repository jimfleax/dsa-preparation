async function test() {
  const query = {
    operationName: "recentAcSubmissions",
    variables: { username: "neetcode", limit: 5 },
    query: "query recentAcSubmissions($username: String!, $limit: Int!) { recentAcSubmissionList(username: $username, limit: $limit) { title titleSlug timestamp } }"
  };
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query)
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
