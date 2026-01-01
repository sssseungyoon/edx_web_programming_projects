document.addEventListener('DOMContentLoaded', function() {


  // have to add the popstate logic as this is a single-page application
  window.onpopstate = function(event) {
    getSection(event.state.section);
  }
  function getSection(section) {
    const url  = section.split('/');
    if (url[0] !== None) {
      switch (url[0]){
        case "inbox":
          pass;
      }
    }
  }
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
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
  console.log('clicked!');
  mailview.innerHTML = '';
  const div = document.createElement('div');
  div.style.display = 'block';

  function mail_specific_format(container, email, name){
    if(name === 'archived') {
      const archived = email[name];
      console.log(archived);
  
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
    else {
      const div = document.createElement('div');
      div.id = name;
      div.innerHTML = `${name}: ${email[name]}`;
      container.append(div);
      console.log(`${name} done`);
    }
  }
  mail_specific_format(div, email, 'sender');
  mail_specific_format(div, email, 'recipients');
  mail_specific_format(div, email, 'subject');
  mail_specific_format(div, email, 'body');
  mail_specific_format(div, email, 'timestamp');
  mail_specific_format(div, email, 'archived');
  

  mailview.append(div);

  
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

      // highlight the div box when the cursor hovers
      div.addEventListener('mouseenter', () => {
        div.style.backgroundColor = 'yellow';
        div.style.borderColor = 'red';
      })
      // load the mail view once the div is clicked
      div.addEventListener('click', () => load_mail(email, mailview));
      // unhighlight the div box when the cursor laves
      div.addEventListener('mouseleave', () => {
        div.style.backgroundColor = 'white';
        div.style.borderColor = 'black';
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

