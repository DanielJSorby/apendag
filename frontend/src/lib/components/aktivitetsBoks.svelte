<script>
    interface Props {
        title?: String
        tidspunkt?: String
        farge?: any
    }
    let {
        title = ""
        tidspunkt = ""
        farge 
    }
</script>
<div id="aktivitetBoks">
    <div class="tekst">
      <h1>{title}</h1>
      <h3>{tidspunkt}</h3>
    </div>
</div>
<style>
    #aktivitetBoks {
        padding: 5rem;
        height: 10rem;
    }
</style>