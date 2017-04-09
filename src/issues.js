'use strict';

const fetch = require('isomorphic-fetch');

function getComments(user, token, org, repo, apiBase, pullRequestNumbers) {
    return Promise.all(pullRequestNumbers.map((prNumber) => {
        return Promise.all([
            fetch(`https://${apiBase}/repos/${org}/${repo}/issues/${prNumber}`, {
                mode: 'cors',
                headers: {
                    'Authorization': `Basic ${btoa(`${user}:${token}`)}`,
                }
            }).then((data) => data.json())
                .then((data) => {
                    return data.comments;
                }),
            fetch(`https://${apiBase}/repos/${org}/${repo}/pulls/${prNumber}`, {
                mode: 'cors',
                headers: {
                    'Authorization': `Basic ${btoa(`${user}:${token}`)}`,
                }
            }).then((data) => data.json())
                .then((data) => {
                    return data.comments + data['review_comments'];
                })
        ]);

    })).then((commentsData) => {
        return commentsData.map((comments) => {
            return comments[0] + comments[1];
        });
    });
}
exports.handler = function (user, token, org, repo, apiBase, pullRequestNumbers) {
    if (!pullRequestNumbers.length) {
        return [];
    }

    return getComments(user, token, org, repo, apiBase, pullRequestNumbers).then((data) => {
        return data;
    });
};
