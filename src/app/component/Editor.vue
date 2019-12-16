<template>
<div class="dbl-click-editor" v-bind:class="{ editing: isEditing }" @dblclick="edit">
  <slot></slot>
  <input class="form-control" v-model="value" @blur="editDone" @keyup.enter.prevent="editDone" @keyup.esc="cancel" autofocus>
</div>
</template>

<script>
/**
 * Created by realm on 2016/12/21.
 */
export default {
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
</script>