import React from 'react'
import Avatar from 'react-avatar';

class IndividualChatMessage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const userName = this.props.userName;
        const postTime = this.props.postTime;
        const chatMsg = this.props.chatMsg;
        return (
            <div className="cccc" style={{display:'flex', paddingBottom: '10px', flexDirection: 'row',color:'white'}}>
                <div>
                    <Avatar color={Avatar.getRandomColor('sitebase', ['red', 'green', 'blue'])} name={userName} size="40" round={true} />
                </div>
                <div style={{display: 'flex', flexDirection: 'column',paddingLeft:'10px'}}>
                    <div style={{display: 'flex', flexDirection:'row'}}>
                        <div>{userName}</div>
                        <div style={{justifyContent: 'flex-end'}}>{postTime}</div>
                    </div>
                    <div>
                        <p>{chatMsg}</p>
                    </div>
                </div>
            </div>
        )
    }
}

export default IndividualChatMessage