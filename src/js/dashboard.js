BoardApp = {
  key: 'ckey_9014ae23814045cdb2d7896827e',
  owner: '0x5DD27C54ed89224db4Ca723383f8F26E1de2d9fF',

  init: function() {
    return BoardApp.getData();
  },

  getData: function() {
    let address = $("#address").val();
    $("#address").val(BoardApp.owner);
    //if (address) {
    if (1) {
      $.ajax({
        url: 'https://api.covalenthq.com/v1/56/address/' + BoardApp.owner + '/balances_v2/?quote-currency=USD&format=JSON&nft=true&no-nft-fetch=true&key=' + BoardApp.key,
        beforeSend: function(xhr) {
        }, 
        success: function(data){        
          let no_nft = data.data.items.filter(item => item.type != "nft");
          let marker_data = no_nft.map(item => ({ 
            "Asset": "<img src='" + item.logo_url + "' width='28px' />" + item.contract_name,           
            "Symbol": item.contract_ticker_symbol,           
            "Contract Address": item.contract_address,           
            "Quantity": item.quote_rate ? item.quote / item.quote_rate : 0,           
            "Price": item.quote_rate,              
            "Value": item.quote,            
          }));
          $('#data-table').dataTable().fnClearTable();
          if (marker_data.length)
            $('#data-table').dataTable().fnAddData(marker_data);        
                
          let nft = data.data.items.filter(item => item.type == "nft");
          let nft_datas = new Array();
          nft.forEach(item => { 
            if (item.nft_data) {
              item.nft_data.forEach(nft_item => {
                nft_datas.push({
                "Token": item.contract_name,           
                "Type": item.supports_erc,           
                "Token ID": nft_item.token_id,              
                });
              });
            }
          });
          $('#data-table-nft').dataTable().fnClearTable();
          if (nft_datas.length)
            $('#data-table-nft').dataTable().fnAddData(nft_datas);        
        }
      })
    }
  }
};

$(function() {
  $(window).load(function() {
    $('#data-table').DataTable({
      "columns": [
          { "data": "Asset" },
          { "data": "Symbol" },
          { "data": "Contract Address" },
          { "data": "Quantity" },
          { "data": "Price" },
          { "data": "Value" },
      ]
    });
    
    $('#data-table-nft').DataTable({
      "columns": [
          { "data": "Token" },
          { "data": "Token ID" },
          { "data": "Type" },
      ]
    });
    BoardApp.init();
  });

  $("#submit").click(function(){
    return BoardApp.getData();
  });
});
