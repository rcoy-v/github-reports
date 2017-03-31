import React from 'react';
import ReactDOM from 'react-dom';
import {handler} from './pull-requests';
import moment from 'moment';
import 'moment-duration-format';

function openDuration(pullRequest) {
    const mergedAt = moment(pullRequest['merged_at']);
    const createdAt = moment(pullRequest['created_at']);

    return moment.duration(mergedAt.diff(createdAt)).format('hh:mm:ss', {trim: false});
}

class Index extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: []
        };
    }

    render() {
        return (
            <main>
                <label>
                    {'user'}
                    <input
                        type="text"
                        onKeyUp={(event) => {
                            this.setState({user: event.target.value});
                        }}/>
                </label>
                <label>
                    {'token'}
                    <input
                        type="password"
                        onKeyUp={(event) => {
                            this.setState({token: event.target.value});
                        }}/>
                </label>
                <label>
                    {'org'}
                    <input
                        type="text"
                        onKeyUp={(event) => {
                            this.setState({org: event.target.value});
                        }}
                    />
                </label>
                <label>
                    {'repo'}
                    <input
                        type="text"
                        onKeyUp={(event) => {
                            this.setState({repo: event.target.value});
                        }}
                    />
                </label>
                <button onClick={() => {
                    handler(this.state.user, this.state.token, this.state.org, this.state.repo)
                        .then((data) => {
                            this.setState({data: data});
                        });
                }}>{'report'}</button>
                <ul>
                    {
                        this.state.data.map((pullRequest) => {
                            return (
                                <li key={pullRequest.id}>
                                    <dl>
                                        <dt>{'pr #'}</dt>
                                        <dd>{pullRequest.number}</dd>
                                    </dl>
                                    <dl>
                                        <dt>{'open duration'}</dt>
                                        <dd>{openDuration(pullRequest)}</dd>
                                    </dl>
                                </li>
                            );
                        })
                    }
                </ul>
            </main>
        );
    }
}

ReactDOM.render(<Index/>, document.getElementById('content'));

