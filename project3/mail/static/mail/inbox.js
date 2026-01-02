document.addEventListener('DOMContentLoaded', function() {

  // have to add the popstate logic as this is a single-page application
  window.onpopstate = function(event) {
    handleLocationChange();
  }
  function handleLocationChange() {
    const path = window.location.pathname;
    if (path === '/inbox') {
      load_mailbox('inbox');
    }
    else if (path === '/compose') {
      compose_email();
    }
    else if (path === '/sent') {
      load_mailbox('sent');
    }
    else if (path === '/archived') {
      load_mailbox('archive');
    }
    else if (path.split('/').length > 2) {
      const emailId = path.split('/')[2];
      // loadmail logic
      fetch(`/emails/${emailId}`)
      .then(response => response.json())
      .then(email => {
        console.log(email);
        load_mail(email, document.querySelector('#emails-view'));
      })
    }
    
  }
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => {
    load_mailbox('inbox');
    history.pushState({},'','/inbox');
  })
  document.querySelector('#sent').addEventListener('click', () => {
    load_mailbox('sent');
    history.pushState({},'','/sent');
  });
  document.querySelector('#archived').addEventListener('click', () => {
    load_mailbox('archive');
    history.pushState({},'','/archive');
  });
  document.querySelector('#compose').addEventListener('click', () => {
    compose_email();
    history.pushState({},'','/compose');
  });
  // Submit button when sending emails
  document.querySelector('#compose-form').addEventListener('submit', function(event){
    event.preventDefault();
    // validation 
    console.log(this);

    const recipient = this.querySelector('#compose-recipients').value;
    const subject = this.querySelector('#compose-subject').value;
    const body = this.querySelector('#compose-body').value;
    console.log(`${recipient}, ${subject}, ${body}`);
    if (recipient.innerHTML !== "" && subject.innerHTML !== "" && body.innerHTML !==  ""){
      fetch('/emails', {
        method: "POST",
        body: JSON.stringify({
          recipients: recipient,
          subject: subject,
          body: body,
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log('API request made');
        console.log(data);
        if (data.message === undefined ){
          document.querySelector('#message').style.color = 'red'
          document.querySelector('#message').innerHTML = `<h4> ${data.error} <h4>`;
        }
        else {
          window.alert("email sent succesfully!");

          load_mailbox('inbox');
        }
        
      })
    }
    else{
      console.log('each field must be filled');
    }
  })
  // By default, load the inbox
  load_mailbox('inbox');
  history.pushState({},'','/inbox');
});

function reset_fields() {
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  reset_fields();
  document.querySelector('#message').style.display = 'none';
}



function load_mail(email, mailview){
  // first clear the main div that displays mails
  mailview.style.display = 'block';
  mailview.innerHTML = '';
  // in case you are accessing the page through popstating, you have to clear the view
  document.querySelector('#compose-view').style.display = 'none';
  
  const div = document.createElement('div');
  div.style.display = 'block';

  function mail_specific_format(container, email, name){
    // logic to add archived button in the mail view
    if(name === 'archived') {
      const archived = email[name];
  
      const button = document.createElement('button');
      button.id = 'archive';
      button.innerText = archived ? 'Unarchive' : 'Archive';
      button.className = "btn btn-sm btn-outline-primary";
  
      button.onclick = function() {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !archived
          })
        })
        .then(() => load_mailbox('archive'));
        
      }
      container.append(button); 
    }
    // all the other text-based elements added through this 
    else {
      const div = document.createElement('div');
      div.id = name;
      div.innerHTML = `${name}: ${email[name]}`;
      container.append(div);
    }
  }
  mail_specific_format(div, email, 'sender');
  mail_specific_format(div, email, 'recipients');
  mail_specific_format(div, email, 'subject');
  mail_specific_format(div, email, 'body');
  mail_specific_format(div, email, 'timestamp');
  mail_specific_format(div, email, 'archived');
  
  // update the read property of the mail
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
  })
  })
  .then(mailview.append(div));

  console.log(mailview.innerHTML);

  // push-state logic
  if(window.location.pathname.split('/').length < 3) {
    const new_path = window.location.pathname + `/${email.id}`;
    history.pushState({},'',new_path);
  }
  
}



function load_mailbox(mailbox) {
  
  const mailview = document.querySelector('#emails-view');

  // Show the mailbox and hide other views
  mailview.style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  function createEmailElement(container, email, name) {
    const div = document.createElement('div');
    // add extra margin for the subject box
    name === 'subject' ? div.style.margin = '0 10px' : div.style.margin = '0 5px'; 
    div.id = name;
    // print the date in a "month / day / year" format
    name === 'timestamp' ? div.innerHTML = email[name].split(',')[0] : div.innerHTML = email[name];
    container.append(div);
    
  }

  // Show the mailbox name
  mailview.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      const div = document.createElement('div');
      // style how each mail will be displayed
      div.style.display = 'grid';
      div.style.gridTemplateColumns = "1fr 4fr 1fr";
      div.style.padding = '5px 5px';

      // set id and classname
      div.id = `${email.id}`;
      div.className = 'email';
      if (email.read === true)  {
        div.classList.add("read");
        console.log(`email read ${email.read}!`);
      }
      

      // highlight the div box when the cursor hovers
      div.addEventListener('mouseenter', () => {
        div.classList.add("highlight");
      })
      // load the mail view once the div is clicked
      div.addEventListener('click', () => load_mail(email, mailview));
      // unhighlight the div box when the cursor laves
      div.addEventListener('mouseleave', () => {
        div.classList.remove("highlight");
      })

      

      if (mailbox === 'inbox') {
        createEmailElement(div, email, 'sender');
      }
      else if (mailbox === 'sent' || mailbox === 'archive'){
        createEmailElement(div, email, 'recipients');
      }
      createEmailElement(div, email, 'subject')
      
      createEmailElement(div, email, 'timestamp');
      mailview.append(div);
    });
  })
}

