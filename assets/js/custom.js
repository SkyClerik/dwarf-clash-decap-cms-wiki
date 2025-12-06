document$.subscribe(function() {
  const openSecretWord = "open";
  const closeSecretWord = "close";
  const body = document.body;

  // Function to open the password prompt
  function promptForPassword() {
    Swal.fire({
      title: 'Enter Password',
      input: 'password',
      inputPlaceholder: 'Enter password (open or close)',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Submit',
      showLoaderOnConfirm: true,
      preConfirm: (password) => {
        if (password === openSecretWord) {
          localStorage.setItem("authenticated", "true");
          body.setAttribute("data-auth", "true");
          return "open";
        } else if (password === closeSecretWord) {
          localStorage.removeItem("authenticated");
          body.removeAttribute("data-auth");
          return "close";
        } else {
          Swal.showValidationMessage('Incorrect password!');
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.value === "open") {
        Swal.fire({
          title: 'Success!',
          text: 'Hidden content unlocked.',
          icon: 'success',
          timer: 1500
        });
      } else if (result.value === "close") {
        Swal.fire({
          title: 'Success!',
          text: 'Hidden content locked.',
          icon: 'success',
          timer: 1500
        });
      }
    });
  }

  // Check if authenticated from previous session
  if (localStorage.getItem("authenticated") === "true") {
    body.setAttribute("data-auth", "true");
  }

  // MutationObserver to add class to secret folders based on secretPaths
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === "childList" || mutation.type === "subtree") {
        document.querySelectorAll('.md-nav__item--nested').forEach(parentLi => {
          const folderNameElement = parentLi.querySelector('label.md-nav__link span.md-ellipsis') || parentLi.querySelector('label.md-nav__title span.md-ellipsis');
          
          if (folderNameElement) {
            const folderName = folderNameElement.textContent.trim();
            const normalizedFolderName = folderName.toLowerCase().replace(/\s/g, '-') + '/';

            // Check if this folder's normalized name is in secretPaths
            if (secretPaths.includes(normalizedFolderName)) {
              if (!parentLi.classList.contains('secret-item')) {
                parentLi.classList.add('secret-item');
                console.log('Added secret-item class to folder:', folderName);
              }
            }
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Глобальные переменные для отслеживания состояния модификаторов
  let isCtrlPressed = false;
  let isAltPressed = false;

  document.addEventListener("keydown", function(event) {
      // Обновляем состояние модификаторов
      if (event.key === "Control") isCtrlPressed = true;
      if (event.key === "Alt") isAltPressed = true;

      // Проверяем комбинацию (Ctrl + Alt + P)
      if (isCtrlPressed && isAltPressed && event.code === "KeyP") { // Используем event.code для клавиши 'P'
          event.preventDefault(); // Prevent default browser behavior
          promptForPassword();
      }
  });

  document.addEventListener("keyup", function(event) {
      // Обновляем состояние модификаторов при отпускании
      if (event.key === "Control") isCtrlPressed = false;
      if (event.key === "Alt") isAltPressed = false;
  });
});
