var Comment = React.createClass({
    rawMarkup: function () {
        var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
        return {__html: rawMarkup};
    },

    render: function () {
        return (
            <div className="comment">
                <h2 className="commentAuthor">
                    {this.props.author}
                </h2>
                <span dangerouslySetInnerHTML={this.rawMarkup()}/>
            </div>
        );
    }
});

var CommentList = React.createClass({
    render: function () {
        var commentNodes = this.props.data.map(function (comment) {
            return (

                <Comment author={comment.author} key={comment.id}>
                    {comment.text}
                </Comment>
            );

        });

        return (
            <div className="commentList">{commentNodes}</div>
        )
    }
});


var CommentForm = React.createClass({
    getInitialState: function () {
        return {author: '', text: ''}
    },
    handleAuthorChange: function (e) {
        this.setState({author: e.target.value})
    },
    handleTextChange: function (e) {
        this.setState({text: e.target.value})
    },
    handleSubmit: function (e) {
        e.preventDefault();
        var author = this.state.author.trim();
        var text = this.state.text.trim();
        if (!text || !author) {
            return
        }
        this.props.onCommentFormSubmit({author: author, text: text});
        this.setState({author: '', text: ''});
    },
    render: function () {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit}>
                <input type="text"
                       placeholder="Your Name"
                       value={this.state.author}
                       onChange={this.handleAuthorChange}
                />
                <input type="text"
                       placeholder="Say something Im giving up on you"
                       value={this.state.text}
                       onChange={this.handleTextChange}
                />
                <input type="submit" value="Post"/>
            </form>
        );

    }
});

var CommentBox = React.createClass({
    getInitialState: function () {
        return {data: []}
    },
    loadCommentsFromServer: function () {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function (data) {
                this.setState({data: data});
            }.bind(this),
            error: function (xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    componentDidMount: function () {
        this.loadCommentsFromServer();
        setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    handleCommentSubmit: function (comment) {
        var currentComments = this.state.data;

        comment.id = Date.now();
        var newComments = currentComments.concat([comment]);
        this.setState({data: newComments});

        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: comment,
            success: function (data) {
                this.setState({data: data});
            }.bind(this),
            error: function (xhr, status, err) {
                this.setState({data: currentComments});
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    render: function () {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentList data={this.state.data}/>
                <CommentForm onCommentFormSubmit={this.handleCommentSubmit}/>
            </div>
        );

    }
});

ReactDOM.render(<CommentBox url="/api/comments" pollInterval={2000}/>, document.getElementById('content'));