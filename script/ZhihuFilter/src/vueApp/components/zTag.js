const template = `
    <div
        class="Tag tag-margin"
        style="height: auto;"
    >
        <div class="Tag-content" style="display: flex; align-items: center;">
            <slot />
            <slot name="extra" />
        </div>
    </div>
`

const script = {

}


export default {
    name: 'z-tag',
    definition: { ...script, template }
}