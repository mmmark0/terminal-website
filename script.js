const App = () => {
  const [theme, setTheme] = React.useState('dark');
  const themeVars = theme === 'dark' ? {
    app: { backgroundColor: '#36393D' },
    terminal: { boxShadow: '0 2px 5px #111' },
    window: { backgroundColor: '#373838', color: '#F4F4F4' }, //373838 26292C F4F4F4
    field: { backgroundColor: '#000', color: '#F4F4F4', fontWeight: 'normal' },
    cursor: { animation: '1.02s blink-dark step-end infinite' } } :
  {
    app: { backgroundColor: '#ACA9BB' },
    terminal: { boxShadow: '0 2px 5px #33333375' },
    window: { backgroundColor: '#5F5C6D', color: '#E3E3E3' },
    field: { backgroundColor: '#E3E3E3', color: '#474554', fontWeight: 'bold' },
    cursor: { animation: '1.02s blink-light step-end infinite' } };


  return /*#__PURE__*/React.createElement("div", { id: "app", style: themeVars.app }, /*#__PURE__*/
  React.createElement(Terminal, { theme: themeVars, setTheme: setTheme }));

};


const Terminal = ({ theme, setTheme }) => {
  const [maximized, setMaximized] = React.useState(false);
  const [title, setTitle] = React.useState('Terminal');
  const handleClose = () => window.location.href = '#';
  const handleMinMax = () => {
    setMaximized(!maximized);
    document.querySelector('#field').focus();
  };

  return /*#__PURE__*/React.createElement("div", { id: "terminal", style: maximized ? { height: '100vh', width: '100vw', maxWidth: '100vw' } : theme.terminal }, /*#__PURE__*/
  React.createElement("div", { id: "window", style: theme.window }, /*#__PURE__*/
  React.createElement("button", { className: "btn red", onClick: handleClose }), /*#__PURE__*/
  React.createElement("button", { id: "useless-btn", className: "btn yellow" }), /*#__PURE__*/
  React.createElement("button", { className: "btn green", onClick: handleMinMax }), /*#__PURE__*/
  React.createElement("span", { id: "title", style: { color: theme.window.color } }, title)), /*#__PURE__*/

  React.createElement(Field, { theme: theme, setTheme: setTheme, setTitle: setTitle }));

};
class Field extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      commandHistory: [],
      commandHistoryIndex: 0,
      fieldHistory: [{ text: 'Welcome'  }, { text: ['Type \'help\' for the complete list of commands.'], hasBuffer: true }],
      userInput: '',
      isMobile: false };

    this.recognizedCommands = [{
      command: 'help',
      purpose: 'Provides help information for Terminal commands.' },
    {
      command: 'date',
      purpose: 'Displays the current date.' },
    {
      command: 'start',
      purpose: 'Launches a specified URL in a new tab or separate window.',
      help: [
      'START <URL>',
      'Launches a specified URL in a new tab or separate window.',
      '',
      'URL......................The website you want to open.'] },

    {
      command: 'clear',
      purpose: 'Clears the Terminal.' },
    {
      command: 'cmd',
      purpose: 'Starts a new instance of the Terminal.' },
    {
      command: 'photo',
      isMain: true,
      purpose: 'Displays Marko\'s photo in ASCII Art.' },
    {
      command: 'cv',
      isMain: true,
      purpose: 'Displays Marko\'s curriculum vitae.' },
    {
      command: 'source',
      purpose: 'Retrieve the website\'s source code from Marko\'s GitHub repository.' },
    {
      command: 'theme',
      purpose: 'Sets the color scheme of the Terminal.',
      help: [
      'THEME <L|LIGHT|D|DARK> [-s, -save]',
      'Sets the color scheme of the Terminal.',
      '',
      'L, LIGHT.................Sets the color scheme to light mode.',
      'D, DARK..................Sets the color scheme to dark mode.',
      '',
      '-s, -save................Saves the setting to localStorage.'] },

    {
      command: 'exit',
      purpose: 'Quits the Terminal and returns to Marko\'s LinkedIn page.' },
    {
      command: 'time',
      purpose: 'Displays the current time.' },
    {
      command: 'motivation',
      purpose: 'Displays a randomly selected motivational phrase for developers.' },
    {
      command: 'about',
      isMain: true,
      purpose: 'Displays basic information about Marko.' },
    {
      command: 'experience',
      isMain: true,
      purpose: 'Displays information about Marko\'s experience.' },
    {
      command: 'skills',
      isMain: true,
      purpose: 'Displays information about Marko\'s skills as a full stack developer.' },
    {
      command: 'contact',
      isMain: true,
      purpose: 'Displays contact information for Marko.' },
    {
      command: 'title',
      purpose: 'Sets the window title for the Terminal.',
      help: [
      'TITLE <INPUT>',
      'Sets the window title for the Terminal.',
      '',
      'INPUT....................The title you want to use for the Terminal window.'] },

    ...['google', 'duckduckgo'].map(cmd => {
      const properCase = cmd === 'google' ? 'Google' : 'DuckDuckGo';

      return {
        command: cmd,
        purpose: `Searches a given query using ${properCase}.`,
        help: [
        `${cmd.toUpperCase()} <QUERY>`,
        `Searches a given query using ${properCase}. If no query is provided, simply launches ${properCase}.`,
        '',
        `QUERY....................It\'s the same as if you were to type inside the ${properCase} search bar.`] };


    })];
    this.handleTyping = this.handleTyping.bind(this);
    this.handleInputEvaluation = this.handleInputEvaluation.bind(this);
    this.handleInputExecution = this.handleInputExecution.bind(this);
    this.handleContextMenuPaste = this.handleContextMenuPaste.bind(this);
  }
  componentDidMount() {
    if (typeof window.orientation !== "undefined" || navigator.userAgent.indexOf('IEMobile') !== -1) {
      this.setState(state => ({
        isMobile: true,
        fieldHistory: [...state.fieldHistory, { isCommand: true }, {
          text: `Unfortunately due to this application being an 'input-less' environment, mobile is not supported. I'm working on figuring out how to get around this, so please bear with me! In the meantime, come on back if you're ever on a desktop.`,
          isError: true,
          hasBuffer: true }] }));


    } else {
      const userElem = document.querySelector('#field');
      const themePref = window.localStorage.getItem('reactTerminalThemePref');

      // Disable this if you're working on a fork with auto run enabled... trust me.
      userElem.focus();

      document.querySelector('#useless-btn').addEventListener('click', () => this.setState(state => ({
        fieldHistory: [...state.fieldHistory, { isCommand: true }, { text: 'SYS >> That button doesn\'t do anything.', hasBuffer: true }] })));


      if (themePref) {
        this.props.setTheme(themePref);
      }
    }
  }
  componentDidUpdate() {
    const userElem = document.querySelector('#field');

    userElem.scrollTop = userElem.scrollHeight;
  }
  handleTyping(e) {
    e.preventDefault();

    const { key, ctrlKey, altKey } = e;
    const forbidden = [
    ...Array.from({ length: 12 }, (x, y) => `F${y + 1}`),
    'ContextMenu', 'Meta', 'NumLock', 'Shift', 'Control', 'Alt',
    'CapsLock', 'Tab', 'ScrollLock', 'Pause', 'Insert', 'Home',
    'PageUp', 'Delete', 'End', 'PageDown'];


    if (!forbidden.some(s => s === key) && !ctrlKey && !altKey) {
      if (key === 'Backspace') {
        this.setState(state => state.userInput = state.userInput.slice(0, -1));
      } else if (key === 'Escape') {
        this.setState({ userInput: '' });
      } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
        const { commandHistory, commandHistoryIndex } = this.state;
        const upperLimit = commandHistoryIndex >= commandHistory.length;

        if (!upperLimit) {
          this.setState(state => ({
            commandHistoryIndex: state.commandHistoryIndex += 1,
            userInput: state.commandHistory[state.commandHistoryIndex - 1] }));

        }
      } else if (key === 'ArrowDown' || key === 'ArrowRight') {
        const { commandHistory, commandHistoryIndex } = this.state;
        const lowerLimit = commandHistoryIndex === 0;

        if (!lowerLimit) {
          this.setState(state => ({
            commandHistoryIndex: state.commandHistoryIndex -= 1,
            userInput: state.commandHistory[state.commandHistoryIndex - 1] || '' }));

        }
      } else if (key === 'Enter') {
        const { userInput } = this.state;

        if (userInput.length) {
          this.setState(state => ({
            commandHistory: userInput === '' ? state.commandHistory : [userInput, ...state.commandHistory],
            commandHistoryIndex: 0,
            fieldHistory: [...state.fieldHistory, { text: userInput, isCommand: true }],
            userInput: '' }),
          () => this.handleInputEvaluation(userInput));
        } else {
          this.setState(state => ({
            fieldHistory: [...state.fieldHistory, { isCommand: true }] }));

        }
      } else {
        this.setState(state => ({
          commandHistoryIndex: 0,
          userInput: state.userInput += key }));

      }
    }
  }
  handleInputEvaluation(input) {
    try {
      const evaluatedForArithmetic = math.evaluate(input);

      if (!isNaN(evaluatedForArithmetic)) {
        return this.setState(state => ({ fieldHistory: [...state.fieldHistory, { text: evaluatedForArithmetic }] }));
      }

      throw Error;
    } catch (err) {
      const { recognizedCommands, giveError, handleInputExecution } = this;
      const cleanedInput = input.toLowerCase().trim();
      const dividedInput = cleanedInput.split(' ');
      const parsedCmd = dividedInput[0];
      const parsedParams = dividedInput.slice(1).filter(s => s[0] !== '-');
      const parsedFlags = dividedInput.slice(1).filter(s => s[0] === '-');
      const isError = !recognizedCommands.some(s => s.command === parsedCmd);

      if (isError) {
        return this.setState(state => ({ fieldHistory: [...state.fieldHistory, giveError('nr', input)] }));
      }

      return handleInputExecution(parsedCmd, parsedParams, parsedFlags);
    }
  }
  handleInputExecution(cmd, params = [], flags = []) {
    if (cmd === 'help') {
      if (params.length) {
        if (params.length > 1) {
          return this.setState(state => ({
            fieldHistory: [...state.fieldHistory, this.giveError('bp', { cmd: 'HELP', noAccepted: 1 })] }));

        }

        const cmdsWithHelp = this.recognizedCommands.filter(s => s.help);

        if (cmdsWithHelp.filter(s => s.command === params[0]).length) {
          return this.setState(state => ({
            fieldHistory: [...state.fieldHistory, {
              text: cmdsWithHelp.filter(s => s.command === params[0])[0].help,
              hasBuffer: true }] }));


        } else if (this.recognizedCommands.filter(s => s.command === params[0]).length) {
          return this.setState(state => ({
            fieldHistory: [...state.fieldHistory, {
              text: [
              `No additional help needed for ${this.recognizedCommands.filter(s => s.command === params[0])[0].command.toLowerCase()}`,
              this.recognizedCommands.filter(s => s.command === params[0])[0].purpose],

              hasBuffer: true }] }));


        }

        return this.setState(state => ({
          fieldHistory: [...state.fieldHistory, this.giveError('up', params[0].toUpperCase())] }));

      }

      return this.setState(state => ({
        fieldHistory: [...state.fieldHistory, {
          text: [
          '',
          'Main commands:',
          ...this.recognizedCommands.
          sort((a, b) => a.command.localeCompare(b.command)).
          filter(({ isMain }) => isMain).
          map(({ command, purpose }) => `${command.toLowerCase()}${Array.from({ length: 15 - command.length }, x => '.').join('')}${purpose}`),
          '',
          'All commands:',
          ...this.recognizedCommands.
          sort((a, b) => a.command.localeCompare(b.command)).
          map(({ command, purpose }) => `${command.toLowerCase()}${Array.from({ length: 15 - command.length }, x => '.').join('')}${purpose}`),
          '',
          'For help about a specific command, type HELP <CMD>, e.g. HELP THEME.'],

          hasBuffer: true }] }));


    } else if (cmd === 'clear') {
      return this.setState({ fieldHistory: [] });
    } else if (cmd === 'start') {
      if (params.length === 1) {
        return this.setState(state => ({
          fieldHistory: [...state.fieldHistory, { text: `Launching ${params[0]}...`, hasBuffer: true }] }),
        () => window.open(/http/i.test(params[0]) ? params[0] : `https://${params[0]}`));
      }

      return this.setState(state => ({
        fieldHistory: [...state.fieldHistory, this.giveError('bp', { cmd: 'START', noAccepted: 1 })] }));

    } else if (cmd === 'cv') {
      return this.setState(state => ({
      // fieldHistory: [...state.fieldHistory, { text: `Apologies! The curriculum vitae is currently unavailable. Please try again later.`, hasBuffer: true }] }));
        fieldHistory: [...state.fieldHistory, { text: `Opening Marko\'s curriculum vitae...`, hasBuffer: true }] }),
      () => window.open('https://markomilicic.com/assets/Marko Milicic CV.pdf'));

    } else if (cmd === 'source') {
      return this.setState(state => ({
        fieldHistory: [...state.fieldHistory, { text: `Opening the GitHub repository for the terminal-website...`, hasBuffer: true }] }),
      () => window.open('https://github.com/mmmark0/terminal-website'));

    } else if (cmd === 'date') {
      return this.setState(state => ({
        fieldHistory: [...state.fieldHistory, { text: `The current date is: ${new Date(Date.now()).toLocaleDateString()}`, hasBuffer: true }] }));

    } else if (cmd === 'photo') {
      return this.setState(state => ({
        fieldHistory: [...state.fieldHistory, {
          text: [
            ``,
            `------------------------------------------------------------`,
            `------------------------------------------------------------`,
            `-------------------------+#++-------------------------------`,
            `---------------------++########++---------------------------`,
            `--------------------################+-----------------------`,
            `-------------------###++++------++####+---------------------`,
            `------------------##+-------------++###+--------------------`,
            `------------------#+---------------++###+-------------------`,
            `------------------#+---------------++###+-------------------`,
            `------------------+++#+++---++####+++###--------------------`,
            `------------------+++++++--+#+++++++++++--------------------`,
            `-----------------+++++#++--++++#++++++++--------------------`,
            `-----------------+--+++-----+++++---+++++-------------------`,
            `-----------------+----------+-------+++++-------------------`,
            `------------------+---------++----++++++--------------------`,
            `-----------------+++---+++##+---+++++++---------------------`,
            `------------------+++++++++++++++++++-----------------------`,
            `------------------+++++++###++++++++------------------------`,
            `-------------------+++++++++++++++++------------------------`,
            `--------------------++++++---++++#++-++#+-------------------`,
            `--------------------##+++++++++##+++########----------------`,
            `------------------+###+++######++++###########--------------`,
            `-----------------+#####++++++++++###############+-----------`,
            `----------------+#######+++++++####################---------`,
            `----------+###############+++######################+--------`,
            `--------##############################################+-----`,
            `------+##################################################---`,
            `-----+####################################################+-`,
            `-----#######################################################`,], hasBuffer: true }] }));

    } else if (cmd === 'motivation') {

      fetch('assets/motivational.json')
        .then(response => response.json())
        .then(data => {
          console.log(data.motivational_sentences.length);
          // Once you have the JSON data, you can get a random phrase
          const randomIndex = Math.floor(Math.random() * data.motivational_sentences.length);
          const randomPhrase = data.motivational_sentences[randomIndex];
          return this.setState(state => ({
            fieldHistory: [...state.fieldHistory, { text: randomPhrase, hasBuffer: true }]
          }));
          })
        .catch(error => {
          console.error('Error loading JSON:', error);
        });

    } else if (cmd === 'cmd') {
      return this.setState(state => ({
        fieldHistory: [...state.fieldHistory, { text: 'Launching new instance of the Terminal...', hasBuffer: true }] }),
      () => window.open('https://markomilicic.com'));
    } else if (cmd === 'theme') {
      const { setTheme } = this.props;
      const validParams = params.length === 1 && ['d', 'dark', 'l', 'light'].some(s => s === params[0]);
      const validFlags = flags.length ? flags.length === 1 && (flags[0] === '-s' || flags[0] === '-save') ? true : false : true;

      if (validParams && validFlags) {
        const themeToSet = params[0] === 'd' || params[0] === 'dark' ? 'dark' : 'light';

        return this.setState(state => ({
          fieldHistory: [...state.fieldHistory, { text: `Set the theme to ${themeToSet.toUpperCase()} mode`, hasBuffer: true }] }),
        () => {
          if (flags.length === 1 && (flags[0] === '-s' || flags[0] === '-save')) {
            window.localStorage.setItem('reactTerminalThemePref', themeToSet);
          }

          setTheme(themeToSet);
        });
      }

      return this.setState(state => ({
        fieldHistory: [...state.fieldHistory, this.giveError(!validParams ? 'bp' : 'bf', !validParams ? { cmd: 'THEME', noAccepted: 1 } : 'THEME')] }));

    } else if (cmd === 'exit') {
      return window.location.href = 'https://www.linkedin.com/in/mmarkomilicic/';
    } else if (cmd === 'time') {
      return this.setState(state => ({
        fieldHistory: [...state.fieldHistory, { text: `The current time is: ${new Date(Date.now()).toLocaleTimeString()}`, hasBuffer: true }] }));

    } else if (cmd === 'about') {
      return this.setState(state => ({
        fieldHistory: [...state.fieldHistory, { text: [
          ``,
          'hey there!',
          `I'm name is Marko, a passionate full stack developer based in Lugano, Switzerland. I'm skilled in Python, Java, C#, and Solidity, and have experience with frameworks like Django, Spring Boot, and Vaadin. I'm also skilled in test automation and web scraping using Selenium.`,
          ``,
          `I'm well-versed in AWS for deploying and scaling applications and have a keen interest in blockchain technology. Currently, I'm expanding my skills with Rust.`,
          ``,
          `I'm always open to new challenges and growth opportunities in software development. Let's build something great together!`,
          ``,
          `Type \'contact\' if you'd like to get in touch - otherwise I hope you enjoy using the rest of the app!`],
          hasBuffer: true }] }));

    } else if (cmd === 'experience') {
      return this.setState(state => ({
        fieldHistory: [...state.fieldHistory, { text: [
          '',
          'Certificates:',
          'CAS Blockchain............................................SUPSI, Lugano',
          'Plan ₿ Summer School, Blockchain..........................Franklin University Switzerland, Lugano',
          'Bachelor in Business Informatics..........................Higher Specialized School of Business Informatics, Bellinzona',
          '',
          'Work:',
          'GoodCode SA, Mendrisio',
          'Full Stack Developer',
          'December 2022 - Present',
          '',
          'Swiss Red Cross, Lugano',
          'Full Stack Developer',
          'August 2021 - April 2022'],
          hasBuffer: true }] }));

    } else if (cmd === 'skills') {
      return this.setState(state => ({
        fieldHistory: [...state.fieldHistory, { text: [
          '',
          'Languages:',
          'Python',
          'Java',
          'C#',
          'SQL',
          'Rust',
          'Solidity',
          '',
          'Libraries/Frameworks:',
          'Django',
          'Spring Boot',
          'Vaadin',
          'Selenium',
          'Bootstrap',
          '',
          'Other:',
          'AWS',
          'GitHub',
          'Blockchain'],
          hasBuffer: true }] }));

    } else if (cmd === 'contact') {
      return this.setState(state => ({
        fieldHistory: [...state.fieldHistory, { text: [
          '',
          'Email: hello@markomilicic.com',
          'Website: markomilicic.com',
          'LinkedIn: @mmarkomilicic',
          'GitHub: @mmmark0'],
          hasBuffer: true }] }));
    } else if (cmd === 'title') {
      return this.setState(state => ({
        fieldHistory: [...state.fieldHistory, {
          text: `Set the Terminal title to ${params.length > 0 ? params.join(' ') : '<BLANK>'}`,
          hasBuffer: true }] }),

      () => this.props.setTitle(params.length > 0 ? params.join(' ') : ''));
    } else if (['google', 'duckduckgo'].some(s => s === cmd)) {
      return this.setState(state => ({
        fieldHistory: [...state.fieldHistory, {
          text: params.length ? `Searching ${cmd.toUpperCase()} for ${params.join(' ')}...` : `Launching ${cmd.toUpperCase()}...`,
          hasBuffer: true }] }),

      () => window.open(params.length ? `https://www.${cmd}.com/${cmd === 'google' ? 'search' : ''}?q=${params.join('+')}` : `https://${cmd}.com/`, '_blank'));
    }
  }
  handleContextMenuPaste(e) {
    e.preventDefault();

    if ('clipboard' in navigator) {
      navigator.clipboard.readText().then(clipboard => this.setState(state => ({
        userInput: `${state.userInput}${clipboard}` })));

    }
  }
  giveError(type, extra) {
    const err = { text: '', isError: true, hasBuffer: true };

    if (type === 'nr') {
      err.text = `${extra} : The term or expression '${extra}' is not recognized. Check the spelling and try again. If you don't know what commands are recognized, type \'help\'.`;
    } else if (type === 'nf') {
      err.text = `The ${extra} command requires the use of flags. If you don't know what flags can be used, type \'help\' ${extra}.`;
    } else if (type === 'bf') {
      err.text = `The flags you provided for ${extra} are not valid. If you don't know what flags can be used, type \'help\' ${extra}.`;
    } else if (type === 'bp') {
      err.text = `The ${extra.cmd} command requires ${extra.noAccepted} parameter(s). If you don't know what parameter(s) to use, type \'help\' ${extra.cmd}.`;
    } else if (type === 'up') {
      err.text = `The command ${extra} is not supported by the HELP utility.`;
    }

    return err;
  }
  render() {
    const { theme } = this.props;
    const { fieldHistory, userInput } = this.state;

    return /*#__PURE__*/React.createElement("div", {
      id: "field",
      className: theme.app.backgroundColor === '#333444' ? 'dark' : 'light',
      style: theme.field,
      onKeyDown: e => this.handleTyping(e),
      tabIndex: 0,
      onContextMenu: e => this.handleContextMenuPaste(e) },

    fieldHistory.map(({ text, isCommand, isError, hasBuffer }) => {
      if (Array.isArray(text)) {
        return /*#__PURE__*/React.createElement(MultiText, { input: text, isError: isError, hasBuffer: hasBuffer });
      }

      return /*#__PURE__*/React.createElement(Text, { input: text, isCommand: isCommand, isError: isError, hasBuffer: hasBuffer });
    }), /*#__PURE__*/
    React.createElement(UserText, { input: userInput, theme: theme.cursor }));

  }}

const Text = ({ input, isCommand, isError, hasBuffer }) => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/
React.createElement("div", null,
isCommand && /*#__PURE__*/React.createElement("div", { id: "query" }, "guest@localhost:~$"), /*#__PURE__*/
React.createElement("span", { className: !isCommand && isError ? 'error' : '' }, input)),

hasBuffer && /*#__PURE__*/React.createElement("div", null));

const MultiText = ({ input, isError, hasBuffer }) => /*#__PURE__*/React.createElement(React.Fragment, null,
input.map(s => /*#__PURE__*/React.createElement(Text, { input: s, isError: isError })),
hasBuffer && /*#__PURE__*/React.createElement("div", null));

const UserText = ({ input, theme }) => /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/
React.createElement("div", { id: "query" }, "guest@localhost:~$"), /*#__PURE__*/
React.createElement("span", null, input), /*#__PURE__*/
React.createElement("div", { id: "cursor", style: theme }));


ReactDOM.render( /*#__PURE__*/React.createElement(App, null), document.querySelector('#root'));
