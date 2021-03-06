$(function(){
	//对页面中的元素进行抽取.
	//方法太凌乱,希望统一管理
	//按钮在JS统一进行监听
	var employeeDatagrid,employeeEditBtnAndQuitBtn,employeeDialog,employeeForm;
	employeeDatagrid = $("#employee_datagrid");
	employeeEditBtnAndQuitBtn = $("#employee_editBtn,#employee_quitBtn");
	employeeDialog = $("#employee_dialog");
	employeeForm = $("#employee_form");
	
	//数据表格
	employeeDatagrid.datagrid({
		fit:true,
		rownumbers:true,
		singleSelect:true,
		pagination:true,
		url:'/employee/list',
		fitColumns:true,
		toolbar:'#employee_datagrid_tb',
		onClickRow:function(rowIndex,rowData){
			//判断当前记录中的状态的值.
			if(rowData.state==1){
				//员工已经离职了,编辑和离职按钮应该变灰.
				employeeEditBtnAndQuitBtn.linkbutton("disable");
			}else{
				//启用按钮
				employeeEditBtnAndQuitBtn.linkbutton("enable");
			}
		}
	});
	//对话框
	employeeDialog.dialog({
		width:300,
		height:300,
		buttons:'#employee_dialog_bt',
		closed:true
	});
	//对按钮进行统一事件监听
	$("a[data-cmd]").on("click",function(){
		var cmd = $(this).data("cmd");
		if(cmd){
			cmdObj[cmd]();
		}
	});
	
	//方法统一管理起来]
	var cmdObj = {
			add:function(){
				//1.清空表单数据
				employeeForm.form("clear");
				//2.设置对话框的标题
				employeeDialog.dialog("setTitle","新增");
				//3.打开对话框
				employeeDialog.dialog("open");
			},
			edit:function(){
				var rowData = employeeDatagrid.datagrid("getSelected");
				if(rowData){
					//1.清空表单数据
					employeeForm.form("clear");
					//2.设置对话框的标题
					employeeDialog.dialog("setTitle","新增");
					//3.打开对话框
					employeeDialog.dialog("open");
					//特殊数据的处理
					if(rowData.dept)
						rowData["dept.id"] = rowData.dept.id;
					//4.回显数据
					employeeForm.form("load",rowData);//基于同名匹配规则
					//回显角色信息.
					//[1,3]----->List<Long>
					$.post("/role/queryRoleIdListForEmployeeForm?employeeId="+rowData.id,function(data){
						$("#roleId").combobox("setValues",data);
					}),"json";
					
				}else{
					$.messager.alert("温馨提示","请选择一条需要修改的数据.","warning");
				}
				
			},
			del:function(){
				var rowData = employeeDatagrid.datagrid("getSelected");
				if(rowData){
					$.messager.confirm("温馨提示","您确定需要离职该员工吗?",function(yes){
						if(yes){
							$.get("/employee/quit?id="+rowData.id,function(data){
								if(data.success){
									$.messager.alert("温馨提示",data.msg,"info",function(){
										//刷新数据表格
										employeeDatagrid.datagrid("reload");
									});
									
								}else{
									$.messager.alert("温馨提示",data.msg,"error");
								}
							},"json")
						}
					});
				}else{
					$.messager.alert("温馨提示","请选择需要离职的员工记录.","warning");
				}
			},
			reload:function(){
				//刷新数据表格
				employeeDatagrid.datagrid("reload");
			},
			save:function(){
				var url;
				var idVal = $("[name='id']").val();
				if(idVal){
					url = "/employee/update";
				}else{
					url = "/employee/save";
				}
				employeeForm.form("submit",{
					url:url,
					onSubmit:function(param){
						//获取所有的角色信息
						var roleIds = $("#roleId").combobox("getValues");
						//把角色信息放入到表单中
						for(var i=0;i<roleIds.length;i++){
							param["roles["+i+"].id"] = roleIds[i];
						}
						return true;
					},
					success:function(data){
						data = $.parseJSON(data);
						if(data.success){
							//提示消息,当点确定的时候,关闭对话框,刷新数据表格
							$.messager.alert("温馨提示",data.msg,"info",function(){
								employeeDialog.dialog("close");
								employeeDatagrid.datagrid("reload");
							});
						}else{
							$.messager.alert("温馨提示",data.msg,"error");
						}
					}
				});
			},
			cancel:function(){},
			searchContent:function(){
				var keyword = $("[name='keyword']").val();
				employeeDatagrid.datagrid("load",{
					keyword:keyword
				});
			}
	}
});
function stateFormatter(value,record,index){
	if(value==0){
		return "<font color='green'>正常</font>";
	}else if(value==1){
		return "<font color='red'>离职</font>";
	}
}
function adminFormatter(value,record,index){
	if(value){
		return "是";
	}else{
		return "否";
	}
}
function deptFormatter(value,record,index){
	if(value){
		return value.name;
	}
	return value;
}
