import React from 'react'
import Avatar from 'react-avatar';

class IndividualUserOnline extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const userName = this.props.userName;
        const userOnline = this.props.userOnline;
        return (
            <div style={{display:'flex', paddingBottom: '10px', flexDirection: 'row',color:'white'}}>
                <div>
                    <Avatar color={Avatar.getRandomColor('sitebase', ['red', 'blue', 'green'])} name={userName} size="40" round={true} />
                </div>
                <div style={{display: 'flex', flexDirection: 'column',paddingLeft:'10px'}}>
                    <div style={{display: 'flex', flexDirection:'row', justifyContent: 'space-between'}}>
                        <div>{userName}</div>
                    </div>
                    <div>
                        <p>{`在线时长:${userOnline}`}</p>
                    </div>
                </div>
            </div>
        )
    }
}

export default IndividualUserOnline