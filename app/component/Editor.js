/**
 * Created by realm on 2016/12/21.
 */
module.exports = {
  name: 'Editor',
  template: '#editor',
  data() {
    return {
      value: this.originValue
    }
  },
  methods: {
    edit() {
      this.$el.classList.add('editing');
    },
    editDone() {
      this.$emit('change', this.value);
      this.$el.classList.remove('editing');
    },
    cancel() {
      this.$el.classList.remove('editing');
    }
  },
  props: ['originValue']
};