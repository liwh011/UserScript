const template = `
    <div class="css-17ucl2c" style="padding: 0;">
        <div class="css-1pysja1">
            <div class="css-uuymsm">{{title}}</div>
            <div class="css-9z9vmi">{{description}}</div>
        </div>
        <slot name="extra" />
    </div>
    <div style="margin-top: 8px;" v-if="$slots.addition">
        <slot name="addition" />
    </div>
`

const script = {
    props: {
        title: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        },
    }
}


export default {
    name: 'z-thing',
    definition: { ...script, template }
}