const template = `
    <label class="Switch" :class="{ 'Switch--checked': modelValue, 'Switch--disabled': disabled }">
        <input
            class="Switch-input"
            type="checkbox"
            v-model="value"
            :disabled="disabled"
        >
    </label>
`

const script = {
    props: [
        'disabled',
        'modelValue'
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
    name: 'z-switch',
    definition: { ...script, template }
}