window.addEventListener('load', () => {
    const pk = PK({
        ctrl: 'MyCtrl',
        data: {
            title: 'The Perfect Apple Pie',
            isShown: false,
            btnMessage: '',
            checkboxMessage: '',
            formSubmitMessage: '',
            btnClicks: 0,
            ingredients: ['Apples', 'Sugar', 'Corn starch', 'Cinnamon', 'Nutmeg', 'Lemon juice']
        },
        methods: {
            toggleItem() {
                this.isShown = !this.isShown;
            },
            buttonClick() {
                this.btnMessage = `Button is clicked ${++this.btnClicks} times`;
            },
            checkboxClick(e) {
                this.checkboxMessage = `Checkbox status is ${e}`;
            },
            submitClick(msg) {
                this.formSubmitMessage = msg;
            }
        }
    });
});