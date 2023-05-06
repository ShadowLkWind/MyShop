import os, stat, uuid

from werkzeug.utils import secure_filename

from application import app, db
from common.libs.Helper import getCurrentDate
from common.models.Image import Image


class UploaodSerice:
    @staticmethod
    def uploadByFile(file):
        config_upload = app.config['UPLOAD']
        resp = {
            'code': 200,
            'msg': "操作成功",
            'data': {}
        }
        filename = secure_filename(file.filename)
        # rsplit:在指定的分隔符处从右侧拆分字符串，并返回字符串列表
        # 参数为1则只拆分最右边的一个点，剩下的不拆分，再取到它，也就是下标为-1的那个
        ext = filename.split('.')[-1]
        if ext not in config_upload['ext']:
            resp['code'] = -1
            resp['msg'] = '不允许的扩展类型文件'
            return resp
        # 从开始的app的相对路径
        root_path = app.root_path + config_upload['prefix_path']
        # 拿到时间创建文件夹
        file_dir = getCurrentDate("%Y%m%d")
        # 保存路径
        save_dir = root_path + file_dir
        # 没有则创建，设置权限
        if not os.path.exists(save_dir):
            os.mkdir(save_dir)
            os.chmod(save_dir, stat.S_IRWXU | stat.S_IRGRP | stat.S_IRWXO)

        # 随机生成文件名
        file_name = str(uuid.uuid4()).replace("-", '') + "." + ext
        # 保存文件
        file.save("{0}/{1}".format(save_dir, file_name))

        model_image = Image()
        model_image.file_key = file_dir + '/' + file_name
        model_image.created_time = getCurrentDate()
        db.session.add(model_image)
        db.session.commit()

        # 返回参数
        resp['data'] = {
            'file_key':  model_image.file_key
        }
        return resp
