$(function(){
  $('#submit').click(()=>{
    let server = $('#select_server').val();
    let project_name = $('#select_project_name').val();
    let account = $('#account').val();
    console.log(server, project_name, account);
    // login().then(res=>{
    //   console.log('res', res);
    //   getToken()
    // }).then(res=>{
    //   console.log('res token', res);
    //   chrome.tabs.create({url: `${server}${project_name}?token=${res}`});
    // }).catch(err=>{

    // })
    // 每次打开一个新的页面
    $.get('http://opentest.59wanmei.com/campus/login.action', function(html){
      let module = html.match(/id="key_module"\s*(.*)/)[1].match(/"(.*)"/)[1];
      let exponent = html.match(/id="key_exponent"\s*(.*)/)[1].match(/"(.*)"/)[1];
      console.log(module, exponent);
      //密码加密
      var key = RSAUtils.getKeyPair(exponent, '', module);
      var password = RSAUtils.encryptedString(key, 'newcapec123');
      $.post('http://opentest.59wanmei.com/campus/j_spring_security_check',
        {
          j_password: password,
          j_username: 'sysadmin'
        },
        function(data, status){
          console.log('ajax:', status, data);
          if(!data.result){
            alert(data.message);
            return
          }
          //获取token
          $.post('http://opentest.59wanmei.com/campus/campus/cpuser/listCustomer.action',
          {
            mobile: 18137803291,
            orderBy: 'id'
          },
          function(data, status){
            console.log('listcustomer', status, data);
            $.post('http://opentest.59wanmei.com/campus/campus/cpuser/listCustomer.action',
            {
              mobile: 18137803291,
              orderBy: 'id'
            },function(data, status){
              let token = data.rows[0].sessionId;
              chrome.tabs.create({url: `${server}${project_name}?token=${token}`});
            })
          })
      })
    });
  })
});

function login(){
  return new Promise((resolve, reject)=>{
    $.get('http://opentest.59wanmei.com/campus/login.action', function(html){
      let module = html.match(/id="key_module"\s*(.*)/)[1].match(/"(.*)"/)[1];
      let exponent = html.match(/id="key_exponent"\s*(.*)/)[1].match(/"(.*)"/)[1];
      //密码加密
      var key = RSAUtils.getKeyPair(exponent, '', module);
      var password = RSAUtils.encryptedString(key, 'newcapec123');
      $.post('http://opentest.59wanmei.com/campus/j_spring_security_check', {
        j_password: password,
        j_username: 'sysadmin'
      },
      function(data, status){
        console.log('ajax:', status, data);
        if(!data.result){
          alert(data.message);
          reject('');
        }
        resolve('');
      })
    })
  })
}

function getToken(mobile){
  return new Promise((resolve, reject)=>{
    $.post('http://opentest.59wanmei.com/campus/campus/cpuser/listCustomer.action',
    {
      mobile: mobile || '18137803291',
      orderBy: 'id'
    },function(data, status){
      if(data.rows){
        resolve(data.rows[0].sessionId);
      }
      reject('');
    })
  })
}

chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
  let url = new URL(details.url);
  details.requestHeaders.push({ name: 'X-Requested-With', value: 'XMLHttpRequest' });
  return { requestHeaders: details.requestHeaders };
}, { urls: ["<all_urls>"] }, ["blocking", "requestHeaders"]);