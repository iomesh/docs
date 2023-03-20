---
id: create-pv
title: Creating PV
sidebar_label: Creating PV
---

To create a PV, you should first create a PVC. Once done, IOMesh will sense the creation of this PVC and automatically create a new PV based on the `spec` in it, binding them together. Then the pair of PV and PVC will be ready to use.

**Prerequisite**

Ensure that there is already a StorageClass available for use.

**Procedure**
1. Create a PVC `iomesh-example-pvc`. Configure the parameters.

    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: iomesh-example-pvc
    spec:
      storageClassName: iomesh-example-sc # Specify the StorageClass.
      accessModes:
        - ReadWriteOnce # Specify the access mode. 问子银哪些可以配置
      resources:
        requests:
          storage: 10Gi # 指定容量，这个值指定有什么要求？
    ```

    For details, refer to [Kubernetes Documentation]().
  
2. Run the following command to create the PVC.

    ```
    kubectl create -f pvc-1.yaml
    ```

3. Run the following command to check the new PVC.

    ```
    kubectl get pvc pvc-1.yaml
    ```
   After running the command, you should see an example like:
    ```output
    NAME                                        STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS        AGE
    iomesh-example-pvc                          Bound    pvc-34230f3f-47dc-46e8-8c42-38c073c40598   10Gi        RWO            iomesh-csi-driver   21h   
    ```