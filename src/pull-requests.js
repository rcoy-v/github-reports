'use strict';

const fetch = require('isomorphic-fetch');
const parseLinkHeader = require('parse-link-header');
const doUntil = require('async.dountil');

function getLastMergedPullRequests(user, token, org, repo, limit = 100, apiBase = 'api.github.com') {
    return new Promise((resolve, reject) => {
        let mergedPullRequests = [],
            nextPage = `https://${apiBase}/repos/${org}/${repo}/pulls?state=closed&sort=updated&direction=desc`;

        function readPullRequestPage(callback) {
            fetch(nextPage, {
                mode: 'cors',
                headers: {
                    'Authorization': `Basic ${btoa(`${user}:${token}`)}`,
                }
            })
                .then((data) => {
                    nextPage = parseLinkHeader(data.headers.get('link')).next.url;
                    return data.json();
                })
                .then((data) => {
                    mergedPullRequests = mergedPullRequests.concat(data.filter((pullRequest) => Boolean(pullRequest['merged_at'])));
                    callback();
                });
        }

        function test() {
            return mergedPullRequests.length >= limit;
        }

        doUntil(readPullRequestPage, test, () => {
            resolve(mergedPullRequests.slice(0, limit));
        });
    });
}

exports.handler = function (user, token, org, repo) {
    return getLastMergedPullRequests(user, token, org, repo)
        .then((pullRequests) => {
            return pullRequests;
        });
};
