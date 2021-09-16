const template = `
    <label class="SearchBar-input Input-wrapper Input-wrapper--grey">
        <input type="text" autocomplete="off" class="Input" :placeholder="placeholder" v-model="value">
    </label>
`

const script = {
    props: [
        'disabled',
        'modelValue',
        'placeholder',
    ],

    emits: ['update:modelValue'],

    computed: {
        value: {
            get() {
                return this.modelValue
            },
            set(value) {
                this.$emit('update:modelValue', value)
            }
        }
    }
}


export default {
    name: 'z-input',
    definition: { ...script, template }
}