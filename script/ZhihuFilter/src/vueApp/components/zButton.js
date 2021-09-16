const template = `
    <button type="button"
        class="Button SearchBar-askButton"
        :class="{ 'Button--primary': type=='primary', 'Button--plain': type=='text', 'Button--blue': !danger, 'Button--red': danger }"
    >
        <slot/>
    </button>
`

const script = {
    props: {
        type: {
            default: 'primary'
        },
        danger: {
            type: Boolean,
            default: false
        }
    }
}


export default {
    name: 'z-button',
    definition: { ...script, template }
}