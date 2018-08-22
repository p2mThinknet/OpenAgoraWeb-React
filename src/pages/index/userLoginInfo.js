import React from 'react'
import Avatar from 'react-avatar';

class UserLoginInfo extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const userName = this.props.userName;
        const loginTime = this.props.loginTime;
        const loginType = this.props.loginType;
        let loginStr = '';
        if(parseInt(loginType) === 0) {
            loginStr = `${userName}以扫描二维码方式签到成功`;
        } else if(parseInt(loginType) === 1) {
            loginStr = `${userName}以面部识别方式签到成功`;
        } else {
            loginStr = `${userName}以远程登录的方式签到成功`;
        }
        return (
            <div style={{display:'flex', paddingBottom: '10px', flexDirection: 'row',color:'white'}}>
                <div>
                    <Avatar color={Avatar.getRandomColor('sitebase', ['red', 'blue', 'green'])} name={userName} size="40" round={true} />
                </div>
                <div style={{display: 'flex', flexDirection: 'column',paddingLeft:'10px'}}>
                    <div style={{display: 'flex', flexDirection:'row'}}>
                        <div>{userName}</div>
                        <div style={{justifyContent: 'flex-end'}}>{loginTime}</div>
                    </div>
                    <div>
                        {}
                        <p>{loginStr}</p>
                    </div>
                </div>
            </div>
        )
    }
}

export default UserLoginInfo