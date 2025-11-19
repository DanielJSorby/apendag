<script lang="ts">
    interface Props {
        title?: String
        tidspunkt?: String
        farge?: String
        plasser?: Number
    }
    let {
        title = "",
        tidspunkt = "",
        farge = "",
        plasser = 0
    }  = $props();
</script>
<div id="aktivitetBoks" style="background-color: {farge};">
    <div class="tekst">
      <h1>{title}</h1>
      <h3>{tidspunkt}</h3>
    </div>
</div>
<style>
    #aktivitetBoks {
        min-width: calc(100vw/8);
        height: 30rem;
    }
    h1 {
        font-size: 15px;
    }
    h3 {
        font-size: 14px;
    }
</style>