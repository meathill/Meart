/**
 * Created by realm on 2016/12/21.
 */
module.exports = {
  name: 'Editor',
  template: '#editor',
  data() {
    return {
      isEditing: false,
      value: this.originValue
    }
  },
  methods: {
    edit() {
      this.isEditing = true;
      if (this.value) {
        this.$el.querySelector('input').setSelectionRange(0, this.value.length);
      }
    },
    editDone() {
      if (!this.isEditing) {
        return;
      }
      this.isEditing = false;
      if (this.value === this.originValue) {
        return;
      }
      this.$emit('change', this.value);
    },
    cancel() {
      this.isEditing = false;
    }
  },
  props: ['originValue']
};