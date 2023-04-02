---
id: create-pv
title: Create PV
sidebar_label: Create PV
---

## Create PV

To create a PV, you should first create a PVC. Once done, IOMesh will sense the creation of this PVC and automatically create a new PV based on the `spec` in it, binding them together. Then the pair of PV and PVC will be ready to use.

**Precaution**

IOMesh supports access modes `ReadWriteOnce`，`ReadWriteMany`，and `ReadOnlyMany`, but `ReadWriteMany` and `ReadOnlyMany` are only for PVs with `volumemode` as Block.

**Prerequisite**

Ensure that there is already a StorageClass available for use.

**Procedure**
1. Create a YAML config `pvc.yaml`. Configure the fields `accessModes` and `storage`.

    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: iomesh-example-pvc
    spec:
      storageClassName: # Specify the StorageClass.
      accessModes:
        - # Specify the access mode. 
      resources:
        requests:
          storage:  # Specify the storage value.
      volumeMode: Block
    ```

    For details, refer to [Kubernetes Documentation](https://kubernetes.io/docs/concepts/storage/persistent-volumes/).
  
2. Apply the YAML config to create the PVC. Once done, the corresponding PV will be created.

    ```
    kubectl apply -f pvc.yaml
    ```

3. Verify that the PVC was created.

    ```
    kubectl get pvc iomesh-example-pvc
    ```
   After running the command, you should see an example like:
    ```output
    NAME                                        STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS        AGE
    iomesh-example-pvc                          Bound    pvc-34230f3f-47dc-46e8-8c42-38c073c40598   10Gi        RWO            iomesh-csi-driver   21h   
    ```

4. View the PV bound to this PVC.

    ```
    kubectl get pv pvc-34230f3f-47dc-46e8-8c42-38c073c40598
    ```
   After running the command, you should see an example like:
    ```output
    NAME                                       CAPACITY   RECLAIM POLICY   STATUS   CLAIM                        STORAGECLASS
    pvc-34230f3f-47dc-46e8-8c42-38c073c40598   10Gi       Delete           Bound    default/iomesh-example-pvc   iomesh-csi-driver
    ```

## Create Authenticated PV 

You can create a PV with authentication and save the authentication information and user credentials in the Kubernetes secret. Every time to access a PV with authentication, you must provide the correct credentials.

This authentication is achieved by configuring a Secret for the StorageClass, and each StorageClass has a separate authentication information. Whenever a user wants to use the StorageClass, the Secret of the StorageClass needs to be configured in the PVC, and the PVC can only be used by the Pod if the data of the two Secrets match exactly.

**Precaution**
- Since authentication is implemented through iSCSI CHAP, the secret password field used for authentication must meet the password length requirements of the CHAP protocol, that is, between 12 and 16.

- 使用 Per StorageClass 的方式鉴权时，由于 StorageClass 为非 namespace 限制的全局对象，而部分 Kubernetes 发行版在默认情况下支持任何 namespace 的用户访问所有的 StorageClass，因此需要使用 RBAC 确保带鉴权功能的 StorageClass 只对必要的用户可见。

**Procedure**
1. Create a Secret for authentication. The user name is `iomesh`, the password is `abcdefghijklmn`, and the namespace is `smtx-system`.

    ```bash
    kubectl create secret generic volume-secret -n smtx-system --from-literal=username=iomesh --from-literal=password=abcdefghijklmn
    ```
2. Create a Secret to provide authentication information with the same username and password as the Secret in the previous step.

    ```bash
    kubectl create secret generic user-secret -n user-namespace --from-literal=username=iomesh --from-literal=password=abcdefghijklmn
    ```
3. Create a StorageClass and refer to the following to configure its parameters.

    ```yaml
    kind: StorageClass
    apiVersion: storage.k8s.io/v1
    metadata:
    name: per-storageclass-auth
    provisioner: com.smartx.csi-driver 
    reclaimPolicy: Retain
    allowVolumeExpansion: true
    parameters:
    csi.storage.k8s.io/fstype: "ext4"
    replicaFactor: "2"
    thinProvision: "true"
    # Enable authentication 
    auth: "true"
    # 鉴权使用的 secret，csi 会通过 pvc 的 annotations 对应字段进行动态提取
    csi.storage.k8s.io/controller-publish-secret-name: volume-secret 
    csi.storage.k8s.io/controller-publish-secret-namespace: smtx-system
    # 登陆认证使用的 secret
    csi.storage.k8s.io/node-stage-secret-name: ${pvc.annotations['iomesh.com/key']}
    csi.storage.k8s.io/node-stage-secret-namespace: ${pvc.namespace}
    ```
    其中 parameters 中引用步骤 1 和 2 所创建的 secret 的字段如下：
    |Field|Description|
    |---|---|
    |`csi.storage.k8s.io/controller-publish-secret-name`| The Secret for authentication.|
    |`csi.storage.k8s.io/controller-publish-secret-namespace`|The NameSpace where the Secret for authentication resides.|
    |`csi.storage.k8s.io/node-stage-secret-name`|登录认证时使用的 secret|
    |`csi.storage.k8s.io/node-stage-secret-namespace`|登录认证时使用的 secret 所在的 namespace|

4. Create a PVC. Use the secret created in Step 2 for authentication in the `iomesh.com/key` field.

    ```yaml
    kind: PersistentVolumeClaim
    apiVersion: v1
    metadata:
    name: user-pvc
    namespace: user-namespace
    # Specify the Secret for authentication.
    annotations:
        iomesh.com/key: user-secret
    spec:
    storageClassName: per-storageclass-auth
    accessModes:
    - ReadWriteOnce
    resources:
        requests:
        storage: 2Gi
    ```