window.addEventListener('load', () => {
    const pk = PK({
        ctrl: 'ReceiptCtrl',
        data: {
            receiptName: '',
            newIngredientName: '',
            newIngredientDescription: '',
            ingredients: []
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
                this.ingredients = this.ingredients.filter(i => i.name !== name);
            }
        }
    });
});