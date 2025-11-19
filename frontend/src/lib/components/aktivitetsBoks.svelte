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
<div id="aktivitetBoks">
    <div class="tekst">
      <h1>{title}</h1>
      <h1 style="background-color: {farge};" id="plasser">{plasser}</h1>
      <h3>TITSpunkter</h3>
      <h3>{tidspunkt["forLunsj"]}</h3>
      <h3>{tidspunkt["etterLunsj"]}</h3>
    </div>
</div>
<style>
    #aktivitetBoks {
        min-width: calc(100vw/8);
        padding: 3rem;
        background-color: var(--color-grey);
        border-radius: 1rem;
        border: 1px solid;
    }
    h1 {
        font-size: 15px;
    }
    h3 {
        font-size: 14px;
    }
    #plasser {
        width: 4rem;
        height: 4rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>