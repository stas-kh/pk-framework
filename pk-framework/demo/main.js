window.addEventListener('load', () => {
    const pk = PK({
        ctrl: 'ReceiptCtrl',
        data: {
            receiptName: '',
            newIngredientName: '',
            newIngredientDescription: '',
            ingredients: [],
            isLoading: false
        },
        methods: {
            addIngredient() {
                this.ingredients.push({
                    name: this.newIngredientName,
                    description: this.newIngredientDescription
                });

                this.newIngredientName = '';
                this.newIngredientDescription = '';
            },
            removeIngredient(name) {
                this.ingredients = this.ingredients.filter(i => i.name.trim() !== name.trim());
            }
        },
        hooks: {
            onCreated() {
                this.isLoading = true;

                setTimeout(() => {
                    fetch(`https://api.myjson.com/bins/poyek`)
                        .then((data) => data.json())
                        .then(data => {
                            this.ingredients = data.ingredients;
                            this.isLoading = false;
                        });
                }, 1000);
            },
            onUpdate() {
                console.log('Did update');
            },
            onMounted() {
                console.log('Mounted to the DOM');
            }
        }
    });
});