import React from 'react';
import ReactDOM from 'react-dom';
import {handler as pullRequestsHandler} from './pull-requests';
import {handler as issuesHandler} from './issues';
import moment from 'moment';
import 'moment-duration-format';

function openTime(pullRequest) {
    const mergedAt = moment(pullRequest['merged_at']);
    const createdAt = moment(pullRequest['created_at']);

    return mergedAt.diff(createdAt);
}

class Index extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            apiBase: '',
            data: [],
            commentsData: [],
            org: '',
            repo: '',
            token: '',
            user: ''
        };
    }

    render() {
        const averageOpenDuration = moment.duration(this.state.data.map((pullRequest) => openTime(pullRequest))
                .reduce((total, next) => {
                    return total + next;
                }, 0) / this.state.data.length)
            .format('hh:mm:ss', {trim: false});

        const within10minutes = this.state.data
            .filter((pullRequest) => moment.duration(openTime(pullRequest)).asMinutes() <= 10)
            .length;

        return (
            <main>
                <label>
                    {'user'}
                    <input
                        onChange={(event) => {
                            this.setState({user: event.target.value});
                        }}
                        type="text"
                        value={this.state.user}
                    />
                </label>
                <label>
                    {'token'}
                    <input
                        onChange={(event) => {
                            this.setState({token: event.target.value});
                        }}
                        type="password"
                        value={this.state.token}
                    />
                </label>
                <label>
                    {'GitHub API base'}
                    <input
                        onChange={(event) => {
                            this.setState({apiBase: event.target.value});
                        }}
                        type="text"
                        value={this.state.apiBase}
                    />
                </label>
                <label>
                    {'org'}
                    <input
                        onChange={(event) => {
                            this.setState({org: event.target.value});
                        }}
                        type="text"
                        value={this.state.org}
                    />
                </label>
                <label>
                    {'repo'}
                    <input
                        onChange={(event) => {
                            this.setState({repo: event.target.value});
                        }}
                        type="text"
                        value={this.state.repo}
                    />
                </label>
                <button onClick={() => {
                    pullRequestsHandler(this.state.user, this.state.token, this.state.org, this.state.repo, this.state.apiBase)
                        .then((data) => {
                            this.setState({data: data});
                            issuesHandler(this.state.user, this.state.token, this.state.org, this.state.repo, this.state.apiBase, data.map((pr) => pr.number))
                                .then((data) => {
                                    this.setState({commentsData: data});
                                });
                        });
                }}>{'report'}</button>
                <dl>
                    <dt>{'average open duration'}</dt>
                    <dd>{averageOpenDuration}</dd>
                </dl>
                <dl>
                    <dt>{'merged within 10 mintues'}</dt>
                    <dd>{within10minutes}</dd>
                </dl>
                <dl>
                    <dt>{'average number of comments'}</dt>
                    {this.state.commentsData.reduce((total, next) => {
                        return total + next;
                    }, 0) / this.state.commentsData.length}
                </dl>
                <dl>
                    <dt>{'no comments'}</dt>
                    {this.state.commentsData.filter((data) => data === 0).length}
                </dl>
            </main>
        );
    }
}

ReactDOM.render(<Index/>, document.getElementById('content'));

